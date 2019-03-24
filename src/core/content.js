import PptxGenJS from 'pptxgenjs';

(function() {

  function sendMessage(msg){
    if(msg) chrome.runtime.sendMessage(msg);
  }

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.type) {
      case 'export':
        exportPP(request, sendResponse);
        return;
      case 'ping':
        sendResponse();
        return;
    }

  });

  function exportPP(request, attempts, callBack){

    const body = cleanBody(request.body);
    const pptx = new PptxGenJS();


    const groups = body.split(/\n{3,}/);

    for(var i = 0; i < groups.length; i++){
      pptx.addNewSlide().back = "000000";
      var slides = groups[i].split("\n\n");
      for(var j = 0; j < slides.length; j++){

        var slide = pptx.addNewSlide();
        slide.back = "000000";
        slide.addText(slides[j].replace(/^\s+|\s+$/g,''), { 
          x:0.0,
          y:2.66,
          fontSize:18,
          color:'ffffff',
          align: "center",
          w:"100%",
          h: 0.27
        });
      }
    }

    

    pptx.save(request.title);

  }

function cleanBody(body){
  const lines = body.split(/\n/);
  for(var i = 0; i < lines.length; i++){
    if(!lines[i].match(/\w/)){
      lines[i] = "";
    }
  }
  return lines.join("\n");
}

}());
