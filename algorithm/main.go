package main

import (
	"fmt"
	"math"
	"sort"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

const StandardRepetitionLimit = 10.0

type BoQItem struct {
	ElementID    string  `json:"element_id"`
	Material     string  `json:"material"`
	Length       float64 `json:"length"`
	Width        float64 `json:"width"`
	AreaSqm      float64 `json:"area_sqm"`
	Quantity     int     `json:"quantity"`
	StartDate    string  `json:"start_date"`
	EndDate      string  `json:"end_date"`
	DurationDays int     `json:"duration_days"`
}

type OptimizationRequest struct {
	Items []BoQItem `json:"items"`
}

type KitDetail struct {
	Dimensions      string   `json:"dimensions"`
	Material        string   `json:"material"`
	RequiredQty     int      `json:"required_qty"`
	RepetitionCount float64  `json:"repetition_count"`
	UsedInElements  []string `json:"used_in_elements"`
}

type OptimizationResponse struct {
	OriginalTotalItems int         `json:"original_boq_items"`
	OptimizedTotalKits int         `json:"optimized_kits_required"`
	TotalRepetition    float64     `json:"total_repetition_factor"`
	CostSavingsPercent float64     `json:"estimated_cost_savings_percent"`
	ExecutionTimeMs    string      `json:"execution_time_ms"`
	KitDetails         []KitDetail `json:"kit_details"`
}

func optimizeFormwork(items []BoQItem) (OptimizationResponse, error) {
	startTime := time.Now()
	var response OptimizationResponse

	if len(items) == 0 {
		return response, nil
	}

	var projectStart time.Time
	first := true
	for _, item := range items {
		t, err := time.Parse("2006-01-02", item.StartDate)
		if err != nil {
			return response, fmt.Errorf("invalid start_date for %s", item.ElementID)
		}
		if first || t.Before(projectStart) {
			projectStart = t
			first = false
		}
	}

	groupedByDims := make(map[string][]BoQItem)
	for _, item := range items {
		dimKey := fmt.Sprintf("%s|%.1fx%.1f", item.Material, item.Length, item.Width)
		groupedByDims[dimKey] = append(groupedByDims[dimKey], item)
	}

	var totalOriginal int
	var totalOptimized int
	var wg sync.WaitGroup
	var mu sync.Mutex

	for dims, groupItems := range groupedByDims {
		wg.Add(1)
		go func(dimKey string, items []BoQItem) {
			defer wg.Done()

			var elements []string
			groupOriginalQty := 0
			dailyChanges := make(map[int]int)
			materialType := items[0].Material

			for _, item := range items {
				elements = append(elements, item.ElementID)
				groupOriginalQty += item.Quantity

				startT, _ := time.Parse("2006-01-02", item.StartDate)
				endT, _ := time.Parse("2006-01-02", item.EndDate)

				startDay := int(startT.Sub(projectStart).Hours() / 24)
				endDay := int(endT.Sub(projectStart).Hours() / 24)

				dailyChanges[startDay] += item.Quantity
				dailyChanges[endDay+1] -= item.Quantity
			}

			var days []int
			for day := range dailyChanges {
				days = append(days, day)
			}
			sort.Ints(days)

			currentActive := 0
			maxConcurrentRequired := 0
			for _, day := range days {
				currentActive += dailyChanges[day]
				if currentActive > maxConcurrentRequired {
					maxConcurrentRequired = currentActive
				}
			}

			limit := StandardRepetitionLimit
			if materialType == "Aluform" {
				limit = 100.0
			} else if materialType == "Plywood" {
				limit = 15.0
			}

			requiredBasedOnLifespan := int(math.Ceil(float64(groupOriginalQty) / limit))
			finalRequiredQty := maxConcurrentRequired
			if requiredBasedOnLifespan > maxConcurrentRequired {
				finalRequiredQty = requiredBasedOnLifespan
			}

			repetition := 0.0
			if finalRequiredQty > 0 {
				repetition = float64(groupOriginalQty) / float64(finalRequiredQty)
			}

			// Clean display label: "Steel 2.4×1.2" instead of "Steel|2.4x1.2"
			displayDims := fmt.Sprintf("%.1fx%.1f", items[0].Length, items[0].Width)

			mu.Lock()
			totalOriginal += groupOriginalQty
			totalOptimized += finalRequiredQty
			response.KitDetails = append(response.KitDetails, KitDetail{
				Dimensions:      displayDims,
				Material:        materialType,
				RequiredQty:     finalRequiredQty,
				RepetitionCount: math.Round(repetition*100) / 100,
				UsedInElements:  elements,
			})
			mu.Unlock()

		}(dims, groupItems)
	}

	wg.Wait()

	response.OriginalTotalItems = totalOriginal
	response.OptimizedTotalKits = totalOptimized

	if totalOptimized > 0 {
		response.TotalRepetition = math.Round((float64(totalOriginal)/float64(totalOptimized))*100) / 100
		response.CostSavingsPercent = math.Round(((float64(totalOriginal-totalOptimized)/float64(totalOriginal))*100)*100) / 100
	}

	execTime := time.Since(startTime)
	response.ExecutionTimeMs = fmt.Sprintf("%.3f ms", float64(execTime.Microseconds())/1000.0)

	return response, nil
}

func main() {
	app := fiber.New(fiber.Config{
		BodyLimit: 50 * 1024 * 1024, // 50MB — handles large BoQ files
	})

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept",
		AllowMethods: "GET, POST, OPTIONS",
	}))

	// ── Health check — powers the status dot in the React topbar ──
	app.Get("/api/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"version": "1.0.0",
			"engine":  "Kit-Optima Go Engine",
			"mode":    "live",
		})
	})

	// ── Main optimization endpoint ─────────────────────────────────
	app.Post("/api/optimize-kitting", func(c *fiber.Ctx) error {
		var req OptimizationRequest

		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Cannot parse JSON. Check your payload format.",
			})
		}

		if len(req.Items) == 0 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "No items in request. Send {items: [...]}",
			})
		}

		result, err := optimizeFormwork(req.Items)
		if err != nil {
			return c.Status(fiber.StatusUnprocessableEntity).JSON(fiber.Map{
				"error": err.Error(),
			})
		}

		return c.JSON(result)
	})

	fmt.Println("╔══════════════════════════════════════════╗")
	fmt.Println("║  Kit-Optima Go Engine — localhost:3000   ║")
	fmt.Println("║  POST /api/optimize-kitting              ║")
	fmt.Println("║  GET  /api/health                        ║")
	fmt.Println("╚══════════════════════════════════════════╝")
	app.Listen(":3000")
}
