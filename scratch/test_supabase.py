import urllib.request
import urllib.error

url = "https://gueonsvxovkhmucjhbht.supabase.co/rest/v1/"
anon_key = "sb_publishable_D7gVFpSj_-KBydfgs8oUbw_x3QLf_fs"

req = urllib.request.Request(url)
req.add_header("apikey", anon_key)
req.add_header("Authorization", f"Bearer {anon_key}")

try:
    print(f"Testing connectivity to {url}...")
    with urllib.request.urlopen(req, timeout=10) as response:
        print(f"Status Code: {response.getcode()}")
        print(f"Response: {response.read().decode()[:100]}")
except urllib.error.URLError as e:
    print(f"URL Error: {e.reason}")
except Exception as e:
    print(f"Error: {e}")

