/* Moteur de recommandation Diagnostic Beauté — v0.1
   Règles : (1) seules les données « Validé » comptent ; « À confirmer » n'est utilisé qu'en mode test ;
   (2) une donnée inconnue n'est jamais favorable ; (3) allergie = correspondance exacte avec un ingrédient listé ;
   (4) pertinence d'abord, disponibilité signalée mais jamais excluante ; (5) aucun produit ajouté pour remplir. */
const MOTEUR=(function(){
 const norm=s=>(s==null?'':String(s)).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[’‘`]/g,"'").replace(/\s+/g,' ').trim();
 const UMAP={'Soin du Visage':'visage','Soin du Corps':'corps','Soin des Mains':'mains','Soins Bucco-dentaire':'bucco','Soin des Cheveux':'cheveux','Soin des Lèvres':'levres'};
 const SOUSCAT_EXCLUES=new Set(Object.keys(UMAP));
 const PARAM={maxEssentiels:4,maxComplementaires:2}; // décision Renaud 18/11/2026
 // Ordre d'application par rôle (sous-catégorie Shopify) — décision Renaud 18/11/2026 : « par rôle du produit » ; ordre à faire valider par Marie-Sophie.
 const ORDRE=['Nettoyant & démaquillant','Gel douche, gel de parfum & savon liquide','Savon, gel & solution lavante mains','Dentifrice','Tonique & eau florale','Sérum & huile visage','Sérum & huile corps','Sérum & gencives','Contour des yeux','Crème hydratante & anti-âge','Crème & lait corps','Crème & lait mains','Déodorant','Protection Solaire','Après Soleil','Rasage','Anti-cellulite & jambes','Gommage corps','Gommage & masque','Brosse à dents & accessoires','Outil de réflexologie'];
 function rang(p){const sc=sousCat(p);let m=99;for(const t of sc){const i=ORDRE.indexOf(t);if(i>=0&&i<m)m=i}return m}
 const TP={'Normale':'normale','Sèche':'seche','Grasse':'grasse','Mixte':'mixte'};
 function typeCite(c1,texte){if(!c1||!TP[c1]||!texte)return false;const t=norm(texte);return t.indexOf(TP[c1])>=0||/tous types? de peaux?|toutes? (les )?peaux/.test(t)}
 function universDe(p){return [...new Set(p.typeDeSoin.filter(t=>UMAP[t]).map(t=>UMAP[t]))]}
 function sousCat(p){return p.typeDeSoin.filter(t=>!UMAP[t])}
 function splitTop(s){const out=[];let d=0,cur='';for(const c of s){if(c==='('||c==='[')d++;if(c===')'||c===']')d=Math.max(0,d-1);if(c===','&&d===0){out.push(cur);cur=''}else cur+=c}if(cur.trim())out.push(cur);return out}
 function ingredients(comp){
  if(!comp)return [];const lines=comp.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);if(lines.length<2)return [];
  const res=new Set();
  for(const raw of splitTop(lines.slice(1).join(', '))){
   const it=raw.replace(/\*/g,'').trim();if(!it)continue;res.add(norm(it));
   const base=it.replace(/\(.*?\)/g,'').trim();if(base)res.add(norm(base));
   for(const m of it.matchAll(/\((.*?)\)/g))for(const sub of m[1].split(/[,;]|\bou\b/))if(sub.trim())res.add(norm(sub));
  }return [...res];
 }
 function compStatut(comp){if(!comp)return 'absente';const l=comp.split(/\r?\n/).filter(x=>x.trim());return (l.length<2||l.slice(1).join(' ').indexOf(',')<0)?'partielle':'complète'}
 const CLES={visage:['D1','D2'],corps:['D3','D4'],mains:['D6','D7'],bucco:['D8','D9']};
 const NOMS={visage:'Visage',corps:'Corps',mains:'Mains',bucco:'Bucco-dentaire'};
 function allergenes(declare,prec){return declare.G1==='Oui'?String(prec.G1||'').split(/[,;\n]| et /).map(norm).filter(Boolean):[]}
 function utilisable(champ,test){return champ&&(champ.statut==='Validé'||(test&&champ.statut==='À confirmer'))}
 function recommander(declare,prec,opt){
  const test=!!opt.test,brouillons=!!opt.brouillons,cat=opt.catalogue,conseil=opt.conseil;
  const sel=declare.A1||[];const univs=Object.keys(NOMS).filter(u=>sel.includes('Tous')||sel.includes(NOMS[u]));
  const alle=allergenes(declare,prec);const res={version:'0.1',test,parametres:PARAM,allergenesSaisis:alle,univers:[]};
  for(const u of univs){
   const [kp,ks]=CLES[u];const principal=declare[kp]||null;const secondaires=declare[ks]||[];
   const bloc={univers:NOMS[u],principal,secondaires,essentiels:[],complementaires:[],exclus:[],note:null};
   const cand=[];
   for(const p of cat){
    if(!universDe(p).includes(u))continue;
    const sc=sousCat(p);
    if(sc.includes('Compléments alimentaires'))continue;
    if(!brouillons&&p.statut!=='ACTIVE'){continue}
    const c=conseil[p.id];const cu=c&&c.preoccupations?c.preoccupations[NOMS[u]]:null;const pre=cu&&utilisable(cu,test)?cu.valeur.map(norm):[];
    const mp=principal&&pre.includes(norm(principal));const ms=secondaires.filter(s=>pre.includes(norm(s)));
    if(!mp&&!ms.length)continue;
    // exclusions de compatibilité (une incompatibilité exclut, quel que soit le score)
    const ing=ingredients(p.composition),st=compStatut(p.composition);
    const hit=alle.filter(a=>ing.includes(a));
    if(hit.length){bloc.exclus.push({id:p.id,titre:p.titre,raison:'Ingrédient déclaré dans la composition : '+hit.join(', ')});continue}
    const acc=sc.some(t=>t==='Outil de réflexologie'||t==='Brosse à dents & accessoires');
    cand.push({id:p.id,titre:p.titre,marque:p.marque,prix:p.prix,image:p.image,url:p.url,disponible:p.disponible,statutCatalogue:p.statut,
     role:sc.join(' · ')||null,principal:!!mp,secondaires:ms,accessoire:acc,
     usage:c&&utilisable(c.usage,test)?c.usage.valeur:null,
     compositionStatut:st,compatibilite:alle.length?(st==='complète'?'Aucun ingrédient déclaré trouvé dans la composition listée':'Compatibilité non vérifiée : composition incomplète'):'Allergies non déclarées',
     typesDePeau:c&&utilisable(c.typesDePeau,test)&&!/^aucun/i.test(c.typesDePeau.valeur)?c.typesDePeau.valeur:null,precautions:c&&utilisable(c.precautions,test)&&!/^(aucun|absent)/i.test(c.precautions.valeur)?c.precautions.valeur:null,statutsDonnees:{preoccupations:cu?cu.statut:'Inconnu'},score:(mp?3:0)+ms.length,rang:rang(p),typeCite:typeCite(declare.C1,c&&utilisable(c.typesDePeau,test)?c.typesDePeau.valeur:null)});
   }
   cand.sort((a,b)=>b.score-a.score||(b.typeCite-a.typeCite)||a.titre.localeCompare(b.titre));
   const ess=cand.filter(x=>x.principal&&!x.accessoire).slice(0,PARAM.maxEssentiels);
   const used=new Set(ess.map(x=>x.id));
   const comp=cand.filter(x=>!used.has(x.id)).slice(0,PARAM.maxComplementaires);
   bloc.essentiels=ess;bloc.complementaires=comp;
   bloc.routine=ess.map(x=>({...x,niveau:'essentiel'})).concat(comp.map(x=>({...x,niveau:'complémentaire'}))).sort((a,b)=>a.rang-b.rang).map((x,i)=>({id:x.id,etape:i+1,niveau:x.niveau}));
   if(!ess.length&&!comp.length)bloc.note='Aucun produit du catalogue ne correspond suffisamment à vos réponses sur la base des informations disponibles.';
   res.univers.push(bloc);
  }return res;
 }
 return{recommander,ingredients,compStatut,norm,universDe};
})();
if(typeof module!=='undefined')module.exports=MOTEUR;
