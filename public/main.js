var api_path = "/api/vm";
var vms_list = new Object();
window.onload = function(){
  form_setup([
    {cmd:"vms", var:"vms"},
    {cmd:"runningvms", var:"alive_vms"},
  ]);
  let submitBtn = document.querySelector("input[data-type='submit']");
  submitBtn.onclick = () => controlForm( 'controlvm' );
}

function form_setup( loading = [] ){
  let req = loading.pop();
  if(req!=undefined){
    VMreq( req.cmd, (res)=>{
      if(res==false){
        alert("Something got wrong");
      }else{
        vms_list[req.var] = JSON.parse(res);
        
        form_setup( loading );
      }
    } );
  }else{
    document.querySelector("[name='vm']").innerHTML = "";
    for(let vm of vms_list.vms){
      let opt = createElement("option", {innerText:vm.name, value:vm.uid});
      let vm_sel = document.querySelector("[name='vm']");
      vm_sel.appendChild( opt );
    }
    for(let vm of vms_list.alive_vms){
      let el = document.querySelector(`[name='vm'] > [value="${vm.uid}"]`);
      el.innerText = `${el.innerText} - alive`;
      console.log(vm, el);
    }
  }
}

function controlForm( formname = "controlvm" ){
  let form = document[formname];
  let vm = form.vm.value,
      status = form.status.value,
      pass = form.pass.value;
  console.log( vm, status, pass );

  let params = `status=${encodeURIComponent( status )}&pass=${encodeURIComponent( pass )}`;
  VMctrl( vm, params, (res)=>{
    alert( res )

    form_setup([
      // {cmd:"vms", var:"vms"},
      {cmd:"runningvms", var:"alive_vms"},
    ]);
  } );
}
function VMctrl(uuid, params, callback){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      callback(xhttp.responseText);
    }else if(this.readyState == 4){
      alert("Error code: "+this.status);
      callback(false);
    }
  };
  xhttp.open("POST", `${api_path}/control/${uuid}`, true);
  xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhttp.send(params);
}

function VMreq(cmd = "vms", callback){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      callback(xhttp.responseText);
    }else if(this.readyState == 4){
      alert("Error code: "+this.status);
      callback(false);
    }
  };
  xhttp.open("GET", `${api_path}/list/${cmd}`, true);
  xhttp.send();
}

function createElement(tag, obj){
  let el = document.createElement(tag);
  if(typeof obj=="object"){
    let list = Object.keys(obj);
    for(var i=0;i<list.length;i++){
      let key = list[i];
      if(typeof obj[key]!='object'){
        el[key] = obj[key];
      }else{
        for(let k of Object.keys(obj[key])){
          el[key][k] = obj[key][k];
        }
      }
    }
  }
  return el;
}