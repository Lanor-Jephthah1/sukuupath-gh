import urllib.request, json

url = "https://translation-api.ghananlp.org/v2/languages"
hdr = {
    'Cache-Control': 'no-cache',
    'Ocp-Apim-Subscription-Key': '29d428117c1e4ed1bdbc6823f5659b1b',
}

req = urllib.request.Request(url, headers=hdr)
try:
    response = urllib.request.urlopen(req)
    print(response.read().decode('utf-8'))
except Exception as e:
    print(e)
