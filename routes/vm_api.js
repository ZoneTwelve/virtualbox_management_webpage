const fs = require("fs");
const { execSync } = require("child_process");
var express = require('express');
const { RESERVED_EVENTS } = require("socket.io/dist/socket");
var router = express.Router();

var pubvms = JSON.parse( fs.readFileSync(`${__dirname}/../bin/public_vms.json`) );
const cmd_params = {
  list: [
    "vms",
    "runningvms"
  ],
}

router.get('/list/:cmd', function(req, res, next){
  // Command like: VBoxManage list vms
  let { list } = cmd_params;
  let { cmd }  = req.params;
  if( list.indexOf(cmd)>-1 ){
    let data = execSync(`VBoxManage list ${cmd}`).toString().split("\n").filter(v=>v!='').map(v=>{
      let match = v.match(/"([\S\s]+)" (\{\S+\})/);
      let r = { name: match[1], uid:match[2] };
      return r;
    });
    data = data.filter( v=>pubvms[v.uid]!==undefined );
    res.json( data );
  }else{
    res.send("Failed", 400);
  }
});

router.post('/control/:uuid', function(req, res){
  // VBoxManage startvm "uuid" --type headless
  // VBoxManage controlvm "uuid" poweroff soft
  let { uuid } = req.params;
  let status = parseInt(req.body.status),
      pass   = req.body.pass;
      
  let cmd = "";
  if( pubvms[uuid]!==undefined ){
    switch(status){
      case 0: cmd = `VBoxManage controlvm "${uuid}" poweroff soft`; break;
      case 1: cmd = `VBoxManage startvm "${uuid}" --type headless`; break;
      default: return res.send("not support this operation");
    }
    if( pubvms[uuid]===null || pubvms[uuid]==pass ){
      try{
        let r = execSync( cmd );
        res.send( r );
      }catch(e){
        res.send("Error", 500);
      }
    }else{
      res.send( "Wrong password" );
    }
  }else{
    res.send("Not allow", 400);
  }

});



module.exports = router;
