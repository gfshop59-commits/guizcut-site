const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync(process.argv[2]||'assets/js/main.js','utf8').replace(/\r\n/g,'\n');
const start=source.indexOf('    function envoyer(demande)');
const end=source.indexOf('\n  }\n',start);
const code=source.slice(start,end);
if(start<0||end<0)throw Error('Fonction introuvable');
async function run(lang,scenario){
 let calls=0,resets=0,stored=0,cleared=0,logs=[];
 const date=1000000;
 const f={elements:{site_web:{value:scenario.trap?'bot':''},nom:{value:'Test'},email:{value:'test@example.invalid'}},reset(){resets++}};
 const button={disabled:false};
 let timer;
 const c={f,bouton:button,Date:{now:()=>date},ouverture:date-(scenario.fast?100:4000),T:(fr,en)=>lang==='en'?en:fr,
  afficher:(...a)=>logs.push(a),derniereDemande:()=>scenario.recent?date-1000:0,
  sessionStorage:{setItem(){stored++}},window:{GZContact:{url:'https://example.invalid',cle:'test'},AbortController},AbortController,
  setTimeout(fn){timer=fn;return 1},clearTimeout(){cleared++},majAvis(){},afficherEtape(){},mode(){},
  fetch:async(_url,opts)=>{calls++;if(scenario.network)throw Error('offline');if(scenario.timeout){timer();throw Error('aborted')}
   return {ok:scenario.http!==false,status:scenario.http===false?500:200,json:async()=>{if(scenario.invalid)throw Error('invalid');return scenario.body}}}
 };
 vm.createContext(c);vm.runInContext(code+'\nenvoyer({apercu:"test",mailto:"mailto:test@example.invalid",corps:"test",sujet:"test"});',c);
 for(let i=0;i<12;i++)await new Promise(setImmediate);
 const blocked=scenario.fast||scenario.trap||scenario.recent;
 const success=!blocked&&!scenario.network&&!scenario.timeout&&!scenario.invalid&&scenario.http!==false&&scenario.body?.success===true;
 assert.equal(calls,blocked?0:1,'fetch');assert.equal(resets,success?1:0,'reset');assert.equal(stored,success?1:0,'stockage');
 assert.equal(button.disabled,false,'bouton');assert.equal(logs.length,1,'message');
 if(!success&&!scenario.recent){assert.equal(logs[0][3],true,'mailto');assert.equal(logs[0][4],true,'erreur');}
 if(scenario.fast)assert.match(logs[0][0],lang==='en'?/not been sent yet/:/pas encore/);
 if(scenario.trap)assert.match(logs[0][0],lang==='en'?/not been sent/:/pas été envoyée/);
 if(!blocked)assert.equal(cleared,1,'nettoyage timer');
 return {lang,scenario:scenario.name,ok:true};
}
(async()=>{const results=[];for(const lang of ['fr','en'])for(const scenario of [
 {name:'rapide',fast:true},{name:'piege',trap:true},{name:'limite-minute',recent:true},
 {name:'succes',body:{success:true}},{name:'refus',body:{success:false}},
 {name:'objet-vide',body:{}},{name:'null',body:null},{name:'json-invalide',invalid:true},
 {name:'chaine-true',body:{success:'true'}},{name:'http-500',http:false,body:{success:true}},
 {name:'reseau',network:true},{name:'expiration',timeout:true}])results.push(await run(lang,scenario));
 console.log(JSON.stringify({scope:'Fonction envoyer extraite du script, réponses réseau simulées, aucun envoi réel, pas de test navigateur',results},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
