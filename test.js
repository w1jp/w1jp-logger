function listProps() {
  Object.keys(props).forEach(function (e){
    Logger.log(e+'='+props[e]);
  });
  var msg=(props.debug)? 'yes':'no';
  Logger.log('DEBUG: '+msg);
}

function testXmlService() {
  var rawxml = HtmlService.createHtmlOutputFromFile('xml').getContent();
  //jlog('rawxml :\n'+rawxml);
  var xmlns = XmlService.getNamespace('http://xmldata.qrz.com');
  var doc = XmlService.parse(rawxml);
  jlog('has root :'+doc.hasRootElement());
  
  var root = doc.getRootElement();
  jlog('root element name: '+root.getName());
  
  root.getChildren().forEach(function (e) {
    jlog('child: '+e.getName());
  });
  
  var callsign = root.getChild('Callsign',xmlns);
  Logger.log('callsign: '+callsign.getName());
  
  root.getChild('Callsign',xmlns).getChildren().forEach(function (e) {
    jlog('Callsign child: '+e.getName());
  });
}

function testQrzGetKey(){
  // page qrz
  
}

function testQrzLookup(){
  var resp = qrzLookup('w4aii')
  jlog('testQrzLookup: '+JSON.stringify(resp))
  
  // test fail
  jlog('testQrzLookup: '+JSON.stringify(qrzLookup('zx4dfg')))
}

// 190529:
function testXml2Obj(){
  var rawxml = HtmlService.createHtmlOutputFromFile('xml').getContent();
  Logger.log('testXml2Obj: '+ JSON.stringify(xml2obj(rawxml)));
}

// 230224 maps test

function testGetHeading(){
  const LatLon = LatLonSpherical;
  const home = new LatLon(26.98021, -82.37402);
  const lot = new LatLon(26.97611, -82.36151);

  jlog(`From home to lot: Bearing: ${home.initialBearingTo(lot)}, Range${home.distanceTo(lot)}`);
}