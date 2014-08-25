//double link list js


//structure of this.data
/***********************
var data = {
  version_id : "",
  child : {},
  parent : {},
  base_id : "",
  operations: ""s
}
***********************/


var Node = function (nodeInfo) {
  this.next = nodeInfo.child;
  this.prev = nodeInfo.parent;
  this.version_id = nodeInfo.version_id;
  this.operations = nodeInfo.operations;
  this.data = nodeInfo;
}

function getChild(node,data){
  for(var k in data){
    if(node.data.child === data[k].version_id)
      return data[k];
  }
  return "undefined";
}

function getChildFromParent(node,data){
  for(var k in data){
    if(node.data.version_id === data[k].parent)
      return data[k];
  }
  return "undefined";
}

//the first element is head, contains the base data of this version 
function linklist() {
  this.init = function(nodeInfo){
    this.head = new Node(nodeInfo);
    this.tail = this.head; 
    this.size = 0;
  }  

  this.insert = function (nodeInfo) {
    this.size++;
    var newNode = new Node(nodeInfo);
    //if only have the head
    if (this.head.next == null) {
      this.head.next = newNode;
      newNode.prev = this.head;
      this.tail = newNode;
      return;
    }

    this.tail.next = newNode;
    newNode.prev = this.tail;
    this.tail = newNode;
  }

  //get node with specific dataURI 
  this.getData = function (version_id) {
    var p = this.head;
    while (p.next != null && p.version_id !== version_id)
      p = p.next;
    return p.data;
  }

  //get node with specific dataURI 
  this.getNode = function (version_id) {
    var p = this.head;
    while (p.next != null && p.data.version_id !== version_id)
      p = p.next;
    return p;
  }


  //remove node with specific dataURI 
  this.removeAt = function (version_id) {
    this.size--;
    var p = this.head;

    while (p.next != null && p.data.version_id !== version_id) {
      p = p.next;
    }

    p.next = p.next.next;//p.next = null; 
    p.next.prev = p;
    return p.data; //return the removed element      
  }

  //get tail
  this.getTail = function () {
    return this.tail;
  }

  //get head
  this.getHead = function(){
    return this.head;
  }

  //get size
  this.getSize = function(){
    return this.size;
  }

  this.createFromArray = function(head,array){
    this.init(head);
    for(var k in array){
      var newNode = new Node(getChildFromParent(this.tail,array));
      //console.log("<this is a child>");
      //console.log(newNode);
      this.insert(newNode.data);
    }
  }

  //print data of all elements
  this.print = function () {
    console.log("We have " + this.size + " elements in total! ");
    console.log("<br/>");
    if (this.head.next == null) {
      return;
    }
    var p = this.head.next;
    while (p.next != null) {
      console.log(p.data);
      p = p.next;
    }
    console.log(p.data); //print last one 
    console.log("<br/>");
  }

  //print data of all elements from the end
  this.printFromBack = function () {
    console.log("We have " + this.size + " elements in total! ");
    console.log("<br/>");
    var tail = this.getTail();
    var p = tail;

    if (p == null) {
      return;
    }
    while (p.prev != null) {
      console.log(p.data);
      p = p.prev;
    }
    console.log("<br/>");
  }
}

exports.linklist = linklist;