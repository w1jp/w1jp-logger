/*
This uses QRZ XML Database access
*/ 

const qrzSession = {
  url: 'https://xmldata.qrz.com/xml/current',
};

function qrzGetKey() {
  const msg = 'qrzGetKey: '
  const cmd = `/?username=${props.qrz_uid}&password=${props.qrz_pwd}&agent=w1jp-logger-v${version}`;
  const sessionTimeOut = 3600000 // ms
  
  // check key timeout
  const currentTime = Date.now()
  if (currentTime < props.session.expire){
    jlog(msg+'Session key current: '+JSON.stringify(props.session))
    return props.session.key
  }
  
  // else get new key 
  const xmlrslt = UrlFetchApp.fetch(qrzSession.url+cmd).getContentText();
  dlog(msg+'xmlrslt :'+xmlrslt);
  
  // parese the XML
  const root = XmlService.parse(xmlrslt).getRootElement();
  const namespace = root.getNamespace();
  dlog(msg+'root :'+root.getName());
  
  // get the key
  qrzSession.key = root.getChild('Session', namespace).getChildText('Key', namespace);
  dlog(msg+'key: '+qrzSession.key);
  
  // set key in script properties
  props.session = {key: qrzSession.key, expire: currentTime+sessionTimeOut};
  PropertiesService.getScriptProperties().setProperty('session', JSON.stringify(props.session));
  jlog(msg+'Updated session key info.');
  
  return props.session.key;
}

// QRZLOOKUP
/// takes a call<string> and looks up qrzdata and
/// call: callsign string
/// returns: js obj
//
// 190529: modified to return obj instead of xml string
function qrzLookup(call) {
  const msg = 'qrzLookup: '
  const qrzSessionKey = qrzGetKey()
  const cmd = `?s=${qrzSessionKey}&callsign=${call}`;
  let xmlrslt = ''
  
  // fetch call
  dlog(msg+'Fetching '+cmd)
  xmlrslt = UrlFetchApp.fetch(qrzSession.url+cmd).getContentText()
  dlog(msg+'Found: '+xmlrslt)
    
  return xml2obj(xmlrslt)
}

// XML2OBJ
/// takes the qrz xml and converts it to a javascript opbject
function xml2obj(xmls) {
  const msg = 'xml2Obj: ';
  let obj = {
    session: {},
    callsign: {}
  };
  // parse xml
  let root;
  try {
    root = XmlService.parse(xmls).getRootElement();
  }
  catch(e){
    jlog(msg+'Error parsing XML: '+e);
    return obj
  }
  
  // iterate through nodes creating object
  // start with <Session> node
  let elem = [];
  const xmlns = root.getNamespace();
  try {
    elem = root.getChild('Session', xmlns).getChildren();
  }
  catch(e){elem=[]} // no session element

  elem.forEach(function(e){
    obj.session[e.getName()] = e.getText();
  });
  
  // now get <Callsign> if exists
  try{
    elem = root.getChild('Callsign', xmlns).getChildren();
  }
  catch(e){elem = []} // no callsign elements
  elem.forEach(function(e){
    obj.callsign[e.getName()] = e.getText();
  });
  
  jlog(msg+'Returning: '+JSON.stringify(obj));
  
  return obj;
}
