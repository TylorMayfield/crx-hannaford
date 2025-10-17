import os
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    # Path to the extension's build directory
    extension_path = os.path.join(os.getcwd(), "dist")

    # Launch a browser with the extension loaded
    context = playwright.chromium.launch_persistent_context(
        "",
        headless=True,
        args=[
            f"--disable-extensions-except={extension_path}",
            f"--load-extension={extension_path}",
        ],
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    )

    page = context.new_page()

    try:
        # Navigate to a page where the content script should run
        page.goto("https://www.hannaford.com/coupons")

        # Wait for the content script to do its thing
        # In a real test, we'd have more sophisticated ways of checking this
        page.wait_for_timeout(5000)

        # Take a screenshot to verify the initial state of the page
        page.screenshot(path="jules-scratch/verification/hannaford_page.png")

    finally:
        context.close()

with sync_playwright() as playwright:
    run(playwright)