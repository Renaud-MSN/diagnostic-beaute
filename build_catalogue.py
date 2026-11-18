import json,datetime,sys
src=sys.argv[1]
d=json.load(open(src))
out=[];ex=0
for p in d:
    if p['handle']=='bougie-naturalite-urbaine-holidermie': ex+=1; continue
    m={x['key']:x['value'] for x in p['metafields']['nodes']}
    try: tds=json.loads(m.get('type_de_soin') or '[]')
    except Exception: tds=[]
    v=(p['variants']['nodes'] or [{}])[0]
    img=((p.get('featuredMedia') or {}).get('preview') or {}).get('image') or {}
    comp=m.get('composition')
    out.append({'id':p['id'].split('/')[-1],'handle':p['handle'],'titre':p['title'],'marque':p['vendor'],
     'statut':p['status'],'typeDeSoin':tds,'prix':v.get('price'),
     'disponible':bool(p.get('totalInventory') and p['totalInventory']>0),'stock':p.get('totalInventory'),
     'url':p.get('onlineStoreUrl'),'image':img.get('url'),
     'composition':comp,'compositionLongueur':len(comp) if comp else 0,
     'conseil':{'typesDePeau':None,'precautions':None}})  # non validé : jamais déduit
meta={'genere':datetime.date.today().isoformat(),'source':'Shopify Admin API (lecture seule)','nbProduits':len(out),'exclus':ex}
open('catalogue.js','w',encoding='utf-8').write('window.CATALOGUE_META='+json.dumps(meta,ensure_ascii=False)+';\nwindow.CATALOGUE='+json.dumps(out,ensure_ascii=False)+';\n')
print(meta, 'sans composition:',sum(1 for p in out if not p['composition']))
