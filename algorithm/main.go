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

// --- Constants & Config ---
// Material constraint: e.g., Plywood degrades after 10 pours, Aluform after 100.
const StandardRepetitionLimit = 10.0 

// --- Data Models (Aligned with Python ETL) ---

type BoQItem struct {
	ElementID    string  `json:"element_id"`
	Material     string  `json:"material"` // Added material
	Length       float64 `json:"length"`
	Width        float64 `json:"width"`
	AreaSqm      float64 `json:"area_sqm"` // Added area
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
	ExecutionTimeMs    string      `json:"execution_time_ms"` // Show off Go's speed!
	KitDetails         []KitDetail `json:"kit_details"`
}

// --- High-Performance Concurrent Optimization Logic ---

func optimizeFormwork(items []BoQItem) (OptimizationResponse, error) {
	startTime := time.Now() // Start the performance timer
	var response OptimizationResponse

	if len(items) == 0 {
		return response, nil
	}

	// 1. Establish "Project Day 0"
	var projectStart time.Time
	first := true
	for _, item := range items {
		t, err := time.Parse("2006-01-02", item.StartDate)
		if err != nil {
			return response, fmt.Errorf("invalid start_date format for %s", item.ElementID)
		}
		if first || t.Before(projectStart) {
			projectStart = t
			first = false
		}
	}

	// 2. Group items by exact dimensions AND material
	groupedByDims := make(map[string][]BoQItem)
	for _, item := range items {
		dimKey := fmt.Sprintf("%s|%.1fx%.1f", item.Material, item.Length, item.Width)
		groupedByDims[dimKey] = append(groupedByDims[dimKey], item)
	}

	// Shared variables for the Goroutines
	var totalOriginal int
	var totalOptimized int
	var wg sync.WaitGroup
	var mu sync.Mutex // Mutex to prevent race conditions when appending results

	// 3. Process each group CONCURRENTLY using Goroutines
	for dims, groupItems := range groupedByDims {
		wg.Add(1) // Add a thread to the wait group

		// Kick off the Goroutine
		go func(dimKey string, items []BoQItem) {
			defer wg.Done() // Mark thread as done when finished

			var elements []string
			groupOriginalQty := 0
			dailyChanges := make(map[int]int)
			materialType := items[0].Material // Extract material for lifespan logic

			for _, item := range items {
				elements = append(elements, item.ElementID)
				groupOriginalQty += item.Quantity
				
				startT, _ := time.Parse("2006-01-02", item.StartDate)
				endT, _ := time.Parse("2006-01-02", item.EndDate)
				
				startDay := int(startT.Sub(projectStart).Hours() / 24)
				endDay := int(endT.Sub(projectStart).Hours() / 24)

				// Sweep-line logic
				dailyChanges[startDay] += item.Quantity
				dailyChanges[endDay+1] -= item.Quantity 
			}

			var days []int
			for day := range dailyChanges {
				days = append(days, day)
			}
			sort.Ints(days)

			// Calculate maximum concurrent formwork needed
			currentActive := 0
			maxConcurrentRequired := 0
			for _, day := range days {
				currentActive += dailyChanges[day]
				if currentActive > maxConcurrentRequired {
					maxConcurrentRequired = currentActive
				}
			}

			// 4. Material-Specific Degradation Constraints
			limit := StandardRepetitionLimit
			if materialType == "Aluform" {
				limit = 100.0 // Aluform lasts much longer
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

			// --- CRITICAL SECTION: Lock the mutex before writing to shared response ---
			mu.Lock()
			totalOriginal += groupOriginalQty
			totalOptimized += finalRequiredQty

			response.KitDetails = append(response.KitDetails, KitDetail{
				Dimensions:      dimKey,
				Material:        materialType,
				RequiredQty:     finalRequiredQty,
				RepetitionCount: math.Round(repetition*100) / 100,
				UsedInElements:  elements,
			})
			mu.Unlock()
			// --- END CRITICAL SECTION ---

		}(dims, groupItems) // Pass variables into the closure
	}

	wg.Wait() // Wait for all concurrent threads to finish

	// 5. Calculate overall metrics
	response.OriginalTotalItems = totalOriginal
	response.OptimizedTotalKits = totalOptimized
	
	if totalOptimized > 0 {
		response.TotalRepetition = math.Round((float64(totalOriginal)/float64(totalOptimized))*100) / 100
		response.CostSavingsPercent = math.Round(((float64(totalOriginal-totalOptimized)/float64(totalOriginal))*100)*100) / 100
	}

	// Record execution time
	execTime := time.Since(startTime)
	response.ExecutionTimeMs = fmt.Sprintf("%.3f ms", float64(execTime.Microseconds())/1000.0)

	return response, nil
}

// --- Server Setup ---

func main() {
	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*", 
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	app.Post("/api/optimize-kitting", func(c *fiber.Ctx) error {
		var req OptimizationRequest
		
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Cannot parse JSON payload. Check your data formatting.",
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

	fmt.Println("Kit-Optima Engine running on http://localhost:3000")
	app.Listen(":3000")
}