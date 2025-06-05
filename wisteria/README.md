# Wisteria: Sustainable Grocery Impact Tracker

Wisteria is a full-stack web application designed to help users make environmentally and economically conscious grocery decisions. Built by a student team as part of CS 411: Database Systems at UIUC, the platform aggregates product environmental costs, location-based emissions, and user preferences to visualize sustainability impact.

> **⚠️ Note:** Due to discontinued access to Google Cloud Platform (GCP), the hosted backend/database is no longer active. While the code is available for review, live interaction is currently disabled.

---

## Features

-  **Grocery List Builder**: Add products from a curated database to your list.
- **Environmental Impact Visualization**: View total emissions and transportation estimates based on your location.
-  **Geolocation-Aware Emissions**: Fuel usage calculated using haversine distance between product origin and user.
-  **Backend Stored Procedures**: Optimized MySQL procedures for list duplication, filtering, and aggregation.
-  **Cloud-Based Architecture**:
  - MySQL on GCP Cloud SQL
  - Google Cloud Storage for image hosting
-  **Sustainability Focus**: Encourages mindful food choices by exposing hidden environmental costs.

---

## Tech Stack

- **Frontend**: Next.js
- **Backend**: Flask (Python)
- **Database**: MySQL (hosted on GCP Cloud SQL)
- **Cloud Services**: Google Cloud Storage (for product images)

---

## Learning Outcomes

- Designed normalized relational schemas and ER diagrams.
- Implemented secure API routes for dynamic data interaction.
- Wrote advanced SQL queries including `JOIN`, `GROUP BY`, and geospatial functions.
- Deployed databases and storage on Google Cloud Platform.
- Practiced full-stack collaboration in a team setting using Git and agile workflows.

---

## Current Limitation

Since GCP access has been suspended, API endpoints relying on the cloud-hosted database are inactive. However, you can still explore the codebase to review architecture, logic, and UI. I also have a video walkthrough of the application which is accessible at this link: 

---

## Contributors

- Medha Muskula  
- Vani Ramesh
- Kathy Lee
- Kevin Zhang



