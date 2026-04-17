import urllib.request, json
url = "https://translation-api.ghananlp.org/v2/translate"
hdr = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Ocp-Apim-Subscription-Key': '29d428117c1e4ed1bdbc6823f5659b1b',
}
payload = json.dumps({"in": "Hello, how are you?", "lang": "en-tw"}).encode('utf-8')

req = urllib.request.Request(url, data=payload, headers=hdr)
try:
    response = urllib.request.urlopen(req)
    print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(e)
    print(e.read().decode('utf-8'))
except Exception as e:
    print(e)
