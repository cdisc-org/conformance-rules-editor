import os
import sys
import json
import time

from seleniumwire import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import brotli

# Get the Preview Deployment URL
RULE_EDITOR_URL = os.getenv("RULE_EDITOR_URL")
if not RULE_EDITOR_URL:
    print("RULE_EDITOR_URL is not set! Test failed.")
    sys.exit(1)

print(f"Running tests on: {RULE_EDITOR_URL}")

# --- Screenshot helper -------------------------------------------------------
def save_screenshot(driver, name_prefix="screenshot"):
    """Save a screenshot with a timestamp into ./screenshots/."""
    timestamp = time.strftime("%Y%m%d-%H%M%S")
    os.makedirs("screenshots", exist_ok=True)
    filename = f"{name_prefix}_{timestamp}.png"
    path = os.path.join("screenshots", filename)
    try:
        driver.save_screenshot(path)
        print(f"Screenshot saved to: {path}")
    except Exception as e:
        print(f"Could not save screenshot: {e}")


# Configure Chrome options
chrome_options = Options()
chrome_options.add_argument("--ignore-certificate-errors")
chrome_options.add_argument("--window-size=1920,1080")
chrome_options.add_argument("--disable-blink-features=AutomationControlled")
chrome_options.add_argument("--headless=new")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.add_argument("--disable-software-rasterizer")
chrome_options.add_argument("--disable-extensions")

# Selenium-wire memory options
seleniumwire_options = {
    "disable_encoding": False,
    "suppress_connection_errors": True,
    "request_storage": "memory",
    "request_storage_max_size": 100,
}

driver = None
wait = None

try:
    # Initialize driver using selenium-wire with memory-limited storage
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(
        service=service,
        options=chrome_options,
        seleniumwire_options=seleniumwire_options,
    )
    wait = WebDriverWait(driver, 30)

    print("Opening Rule Editor site...")
    driver.get(RULE_EDITOR_URL)

    # Search for rule CG0006
    print("Waiting for rule search field to be visible...")
    rule_search_field = wait.until(
        EC.visibility_of_element_located((By.XPATH, '//*[@id="mui-10"]'))
    )
    print("Waiting for rule search field to be clickable...")
    rule_search_field = wait.until(
        EC.element_to_be_clickable((By.XPATH, '//*[@id="mui-10"]'))
    )
    print("Rule search field is ready.")

    print("Searching for rule CG0006...")
    rule_search_field.click()
    rule_search_field.send_keys("CG0006")

    # allow time for results to load
    time.sleep(5)

    print("Waiting for search result row to be clickable...")
    search_result = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, '//*[@id="rulesList"]/table/tbody/tr/td[1]')
        )
    )
    search_result.click()
    print("Rule selected.")

    # Switch to Test tab (wait style similar to engine)
    print("Waiting for test tab button to be visible...")
    test_tab_button = wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, '//*[@id="root"]/div/div[3]/div/div[1]/div/div/div/button[2]')
        )
    )
    print("Waiting for test tab button to be clickable...")
    test_tab_button = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, '//*[@id="root"]/div/div[3]/div/div[1]/div/div/div/button[2]')
        )
    )

    print("Switching to test tab...")
    test_tab_button.click()

    # Allow time for schema validation
    time.sleep(4)

    # Open upload dataset tab
    print("Waiting for upload dataset tab to be visible...")
    upload_dataset_tab = wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, '//*[@id="tabpanel-1"]/div[5]/div[1]/div[2]')
        )
    )
    print("Waiting for upload dataset tab to be clickable...")
    upload_dataset_tab = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, '//*[@id="tabpanel-1"]/div[5]/div[1]/div[2]')
        )
    )

    print("Opening upload dataset tab...")
    upload_dataset_tab.click()

    # Upload dataset file
    print("Waiting for file input to be present...")
    file_input = wait.until(
        EC.presence_of_element_located(
            (
                By.XPATH,
                '//*[@id="tabpanel-1"]/div[5]/div[2]/div/div/div/div/label/input',
            )
        )
    )

    print("Uploading dataset file...")
    file_path = os.path.abspath("tests/unit-test-coreid-CG0006-negative 1.xlsx")
    file_input.send_keys(file_path)

    # Wait for error result and capture output
    print("Waiting for error result to appear...")
    error_result = WebDriverWait(driver, 30).until(
        EC.visibility_of_element_located(
            (By.XPATH, '//*[@id="tabpanel-1"]/div[6]/div[1]/div[1]/span/div/span')
        )
    )
    print("Error result displayed.")

    # Give a few seconds for the POST request to complete
    time.sleep(3)

    # Capture /api/rules/execute response
    rule_exec_response = None
    for request in driver.requests:
        if "/api/rules/execute" in request.url:
            if request.response:
                try:
                    raw_body = request.response.body
                    decompressed = brotli.decompress(raw_body).decode("utf-8")
                    rule_exec_response = json.loads(decompressed)
                    print("Captured and decoded response from /api/rules/execute")
                    break
                except Exception as e:
                    print("Error decoding response body:", e)

    # Best-effort: clear recorded requests to limit memory
    try:
        driver.requests.clear()
    except Exception:
        pass

    if rule_exec_response is None:
        print("Test Failed: API response from /api/rules/execute was not captured.")
        save_screenshot(driver, "no_rule_exec_response")
        sys.exit(1)

    # Expected content
    expected_json = {
        "DM": [
            {
                "executionStatus": "success",
                "dataset": "dm.xpt",
                "domain": "DM",
                "variables": [],
                "message": None,
                "errors": [],
            }
        ],
        "FA": [
            {
                "executionStatus": "success",
                "dataset": "fa.xpt",
                "domain": "FA",
                "variables": ["$val_dy", "FADTC", "FADY", "RFSTDTC"],
                "message": (
                    "FADY is not calculated correctly even though the date portion of FADTC is complete, "
                    "the date portion of DM.RFSTDTC is a complete date, and FADY is not empty."
                ),
                "errors": [
                    {
                        "value": {
                            "FADY": 35,
                            "RFSTDTC": "2012-11-15",
                            "FADTC": "2012-12-02",
                            "$val_dy": 18,
                        },
                        "dataset": "fa.xpt",
                        "row": 1,
                        "USUBJID": "CDISC002",
                        "SEQ": 1,
                    },
                    {
                        "value": {
                            "FADY": 3,
                            "RFSTDTC": "2013-10-08",
                            "FADTC": "2013-10-12",
                            "$val_dy": 5,
                        },
                        "dataset": "fa.xpt",
                        "row": 2,
                        "USUBJID": "CDISC004",
                        "SEQ": 2,
                    },
                    {
                        "value": {
                            "FADY": -30,
                            "RFSTDTC": "2013-01-05",
                            "FADTC": "2012-12-02",
                            "$val_dy": -34,
                        },
                        "dataset": "fa.xpt",
                        "row": 4,
                        "USUBJID": "CDISC007",
                        "SEQ": 4,
                    },
                    {
                        "value": {
                            "FADY": 230,
                            "RFSTDTC": "2014-05-11",
                            "FADTC": "2014-12-02",
                            "$val_dy": 206,
                        },
                        "dataset": "fa.xpt",
                        "row": 5,
                        "USUBJID": "CDISC008",
                        "SEQ": 5,
                    },
                ],
            }
        ],
        "IE": [
            {
                "executionStatus": "success",
                "dataset": "ie.xpt",
                "domain": "IE",
                "variables": ["$val_dy", "IEDTC", "IEDY", "RFSTDTC"],
                "message": (
                    "IEDY is not calculated correctly even though the date portion of IEDTC is complete, "
                    "the date portion of DM.RFSTDTC is a complete date, and IEDY is not empty."
                ),
                "errors": [
                    {
                        "value": {
                            "RFSTDTC": "2022-03-20",
                            "IEDTC": "2022-03-17",
                            "$val_dy": -3,
                            "IEDY": -4,
                        },
                        "dataset": "ie.xpt",
                        "row": 1,
                        "USUBJID": "CDISC-TEST-001",
                        "SEQ": 1,
                    }
                ],
            }
        ],
        "LB": [
            {
                "executionStatus": "success",
                "dataset": "lb.xpt",
                "domain": "LB",
                "variables": ["$val_dy", "LBDTC", "LBDY", "RFSTDTC"],
                "message": (
                    "LBDY is not calculated correctly even though the date portion of LBDTC is complete, "
                    "the date portion of DM.RFSTDTC is a complete date, and LBDY is not empty."
                ),
                "errors": [
                    {
                        "value": {
                            "RFSTDTC": "2022-03-20",
                            "LBDY": 2,
                            "LBDTC": "2022-03-30",
                            "$val_dy": 11,
                        },
                        "dataset": "lb.xpt",
                        "row": 1,
                        "USUBJID": "CDISC-TEST-001",
                        "SEQ": 1,
                    }
                ],
            }
        ],
    }

    # Compare result
    if rule_exec_response == expected_json:
        print("Test Passed: API response matches expected JSON.")
        save_screenshot(driver, "success")
    else:
        print("Test Failed: API response does NOT match expected JSON.")
        print("Received:")
        print(json.dumps(rule_exec_response, indent=2))
        save_screenshot(driver, "mismatch")
        sys.exit(1)

except Exception as e:
    print(f"Test Failed due to exception: {e}")
    if driver is not None:
        save_screenshot(driver, "exception")
    sys.exit(1)

finally:
    if driver is not None:
        try:
            driver.quit()
        except Exception as e:
            print(f"Error while quitting driver: {e}")
