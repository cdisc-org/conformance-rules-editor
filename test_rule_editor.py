import os
import sys
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Get the Preview Deployment URL
RULE_EDITOR_URL = os.getenv("RULE_EDITOR_URL")
if not RULE_EDITOR_URL:
    print("RULE_EDITOR_URL is not set! Test failed.")
    sys.exit(1)

print(f"Running tests on: {RULE_EDITOR_URL}")

# Configure Chrome options
chrome_options = Options()
chrome_options.add_argument("--ignore-certificate-errors")
chrome_options.add_argument("--window-size=1920,1080")
chrome_options.add_argument("--disable-blink-features=AutomationControlled")
chrome_options.add_argument("--headless=new")  # Enable headless mode

# Initialize ChromeDriver
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)
wait = WebDriverWait(driver, 20)

try:
    print("Opening Rule Editor site...")
    driver.get(RULE_EDITOR_URL)

    print("Checking username field...")
    username_field = wait.until(EC.presence_of_element_located((By.XPATH, '//*[@id="signInName"]')))
    username_field.send_keys('yexame7861@lxheir.com')

    print("Checking password field...")
    password_field = wait.until(EC.presence_of_element_located((By.XPATH, '//*[@id="password"]')))
    password_field.send_keys('@Test@Test123')

    print("Checking sign-in button...")
    sign_in_button = wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="next"]')))
    sign_in_button.click()

    print("Checking cross button...")
    cross_button = wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="rulesList"]/table/thead/tr/th[2]/div/div/button')))
    cross_button.click()

    print("Checking first table element...")
    first_table_element = wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="rulesList"]/table/tbody/tr[1]')))
    first_table_element.click()

    print("Checking test tab button...")
    test_tab_button = wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="root"]/div/div[3]/div/div[1]/div/div/div/button[2]')))
    test_tab_button.click()

    print("Checking upload dataset tab...")
    upload_dataset_tab = wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="tabpanel-1"]/div[5]/div[1]/div[2]')))
    upload_dataset_tab.click()

    print("Checking file upload input field...")
    file_input = wait.until(EC.presence_of_element_located((By.XPATH, '//*[@id="tabpanel-1"]/div[5]/div[2]/div/div/div/div/label/input')))

    file_path = os.path.abspath('unit-test-coreid-CG0002-negative.xlsx')
    print(f"Uploading file: {file_path}")
    file_input.send_keys(file_path)

    print("Test Passed! Everything worked as expected.")

except Exception as e:
    print(f"Test Failed: {e}")
    sys.exit(1)

finally:
    driver.quit()