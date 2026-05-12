# Shopify Empty Collections Extractor

A vanilla JavaScript script designed to be run directly in the browser's Developer Tools console. It automatically identifies and extracts a list of all "empty" collections (collections containing 0 products) from a Shopify store and downloads the results as a CSV file.

## Features
- **No authentication required:** Uses the public Shopify Storefront JSON API (`/collections.json` and `/products.json`).
- **Pagination Support:** Automatically paginates through all collections up to the API limits.
- **Throttling:** Built-in delays to avoid hitting Shopify's rate limits.
- **CSV Export:** Automatically generates and downloads a CSV file with the empty collection handles, titles, and URLs.

## Usage

1. Open your web browser and navigate to the public storefront of the target Shopify store (e.g., `https://your-store.myshopify.com`).
2. Open the Developer Tools console:
   - **Windows/Linux:** Press `Ctrl` + `Shift` + `J` (Chrome/Edge) or `Ctrl` + `Shift` + `K` (Firefox).
   - **Mac:** Press `Cmd` + `Option` + `J` (Chrome/Edge) or `Cmd` + `Option` + `K` (Firefox).
3. Copy the entire contents of `shopify-empty-collections.js`.
4. Paste the script into the console and press `Enter`.
5. Wait for the script to finish scanning. A CSV file named `shopify-empty-collections.csv` will automatically download once complete.

## Disclaimer
This script is intended for store owners or administrators to manage their own collections. Use responsibly and within Shopify's terms of service.
