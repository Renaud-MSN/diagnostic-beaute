# Génère conseil.js à partir du fichier global de validation (validation-globale-marie-sophie.xlsx).
# Décision du 18/11/2026 : « tout est validé » (Renaud, au nom de Marie-Sophie) -> toute information renseignée est « Validé » ;
# une information absente reste « Inconnu » (jamais favorable). Aucune interprétation du texte n'est faite ici.
import openpyxl,json,sys
ws=openpyxl.load_workbook(sys.argv[1])['Validation globale']
ABS=('Information absente','Page officielle non lue','Aucune préoccupation')
def ok(v): return bool(v) and not str(v).startswith(ABS)
out={}
for r in ws.iter_rows(min_row=2,values_only=True):
    pid,univ,nom,marque,sous,dispo,tp_f,pr_f,us_f,pre,tp_o,pr_o,url,dec,corr,orig=(list(r)+[None]*16)[:16]
    if (dec or '').strip()=='Retirer': continue
    pu={}
    if ok(pre):
        for blk in str(pre).split(' | '):
            u,_,lst=blk.partition(' : ')
            pu[u.strip()]={'valeur':[x.strip() for x in lst.split(' ; ') if x.strip()],'statut':'Validé'}
    tp=tp_o if ok(tp_o) else (tp_f if ok(tp_f) else None)
    pr=pr_o if ok(pr_o) else (pr_f if ok(pr_f) else None)
    out[str(pid)]={'preoccupations':pu,
      'usage':{'valeur':us_f if ok(us_f) else None,'statut':'Validé' if ok(us_f) else 'Inconnu'},
      'typesDePeau':{'valeur':tp,'statut':'Validé' if tp else 'Inconnu'},
      'precautions':{'valeur':pr,'statut':'Validé' if pr else 'Inconnu'}}
open('conseil.js','w',encoding='utf-8').write('window.CONSEIL='+json.dumps(out,ensure_ascii=False)+';\n')
print(len(out),'produits ;',sum(1 for v in out.values() if v['preoccupations']),'avec préoccupations ;',sum(1 for v in out.values() if v['typesDePeau']['valeur']),'avec types de peau ;',sum(1 for v in out.values() if v['precautions']['valeur']),'avec précautions')
