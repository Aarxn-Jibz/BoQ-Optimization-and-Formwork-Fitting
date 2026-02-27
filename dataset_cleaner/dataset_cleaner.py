# -*- coding: utf-8 -*-
"""
L&T CreaTech 2026 - Problem Statement 4
Kit-Optima: Generative BoQ Data Pipeline
Role: Team Member 1 (Data & Strategy)
"""

import pandas as pd
import numpy as np
import json
import os
from datetime import datetime, timedelta

class BoQDataPipeline:
    def __init__(self, num_rows=1000, base_date="2026-03-01"):
        self.num_rows = num_rows
        self.base_date = datetime.strptime(base_date, "%Y-%m-%d")
        self.raw_file = 'BoQ_Dataset_Raw.csv'
        self.clean_file = 'BoQ_Data_Cleaned.json'
        
        # L&T Realism: Standard formwork materials and their realistic dimensions
        self.kit_templates = [
            {"type": "Metro-Pier-Cap", "length": 2.4, "width": 1.2, "material": "Steel"},
            {"type": "Tower-Column", "length": 3.0, "width": 0.6, "material": "Aluform"},
            {"type": "Podium-Slab", "length": 1.8, "width": 1.8, "material": "Plywood"},
            {"type": "Retaining-Wall", "length": 2.4, "width": 2.4, "material": "Aluform"},
            {"type": "Bridge-Girder", "length": 4.0, "width": 0.4, "material": "Steel"}
        ]

    def generate_raw_data(self):
        """Generates realistic, slightly messy construction data."""
        print(f"[*] Generating {self.num_rows} rows of raw L&T project data...")
        data = []

        for i in range(self.num_rows):
            template = np.random.choice(self.kit_templates)
            
            # 40% chance of sequential task (Perfect for repetition analytics)
            if i > 0 and np.random.random() < 0.4:
                prev_item = data[i-1]
                try:
                    start_dt = datetime.strptime(prev_item['end_date'], '%Y-%m-%d') + timedelta(days=1)
                except:
                    start_dt = self.base_date + timedelta(days=np.random.randint(0, 30))
                element_prefix = prev_item['element_id'].rsplit('-', 1)[0]
            else:
                start_dt = self.base_date + timedelta(days=np.random.randint(0, 90))
                element_prefix = f"Zone{np.random.randint(1,5)}-{template['type']}"

            duration = np.random.randint(3, 14)
            end_dt = start_dt + timedelta(days=duration)

            # Injecting intentional "messy" data for the cleaner to fix (Real world scenario)
            qty = np.random.choice([5, 10, 15, 20, np.nan]) # Occasional missing quantity
            length = template['length'] + (np.random.choice([0.001, -0.002, 0])) # Minor measurement float errors

            data.append({
                "element_id": f"{element_prefix}-{i:04d}",
                "material": template['material'],
                "length": length,
                "width": template['width'],
                "quantity": qty,
                "start_date": start_dt.strftime('%Y-%m-%d'),
                "end_date": end_dt.strftime('%Y-%m-%d')
            })

        df = pd.DataFrame(data)
        df.to_csv(self.raw_file, index=False)
        print(f"[+] Raw data saved to {self.raw_file}")
        return df

    def clean_and_transform(self):
        """Transforms messy CSV into optimized JSON for the Go Backend."""
        print("[*] Starting Data ETL & Strategy Pipeline...")
        
        if not os.path.exists(self.raw_file):
            print("[-] Error: Raw file not found.")
            return

        df = pd.read_csv(self.raw_file)
        initial_count = len(df)

        # 1. Handle Missing Values (Imputation)
        df['quantity'] = df['quantity'].fillna(1).astype(int)
        df = df.dropna(subset=['length', 'width', 'start_date', 'end_date'])

        # 2. Standardization & Dimension Snapping (Crucial for reuse)
        df['element_id'] = df['element_id'].astype(str).str.strip().str.upper()
        df['length'] = df['length'].round(1)
        df['width'] = df['width'].round(1)

        # 3. Robust Date Parsing
        df['start_date'] = pd.to_datetime(df['start_date'], errors='coerce')
        df['end_date'] = pd.to_datetime(df['end_date'], errors='coerce')
        df = df.dropna(subset=['start_date', 'end_date'])
        df = df[df['end_date'] >= df['start_date']] # Drop logical errors

        # 4. Feature Engineering
        df['area_sqm'] = (df['length'] * df['width']).round(3)
        df['duration_days'] = (df['end_date'] - df['start_date']).dt.days

        # 5. Convert to Go Backend JSON Schema
        cleaned_items = []
        for _, row in df.iterrows():
            cleaned_items.append({
                "element_id": row['element_id'],
                "material": row['material'],
                "length": float(row['length']),
                "width": float(row['width']),
                "area_sqm": float(row['area_sqm']),
                "quantity": int(row['quantity']),
                "start_date": row['start_date'].strftime('%Y-%m-%d'),
                "end_date": row['end_date'].strftime('%Y-%m-%d'),
                "duration_days": int(row['duration_days'])
            })

        with open(self.clean_file, 'w') as f:
            json.dump({"items": cleaned_items}, f, indent=2)

        # 6. Pitch Metrics (Screenshot these for PPT!)
        print("\n" + "="*40)
        print("🚀 L&T KIT-OPTIMA: ETL SUMMARY")
        print("="*40)
        print(f"Total Rows Processed : {initial_count}")
        print(f"Dirty Rows Cleaned   : {initial_count - len(df)}")
        print(f"Total Formwork Area  : {(df['area_sqm'] * df['quantity']).sum():,.2f} sqm")
        print(f"Materials Tracked    : {', '.join(df['material'].unique())}")
        print(f"Pipeline Status      : SUCCESS -> {self.clean_file} ready for Go Engine.")
        print("="*40 + "\n")

if __name__ == "__main__":
    # Generate a massive 10,000 row dataset to show off Go's speed later!
    pipeline = BoQDataPipeline(num_rows=10000)
    pipeline.generate_raw_data()
    pipeline.clean_and_transform()