//double link list js


//structure of this.data
/***********************
var data = {
  reversion_id : "",
  child : {},
  parent : {},
  base_id : "",
  operations: ""
}
***********************/


var Node = function (pData) {
  this.next = null;
  this.prev = null;
  this.data = pData;
}

function getChild(node,data){
  for(var k in data){
    if(node.data.child === data[k].reversion_id)
      return data[k];
  }
  return "undefined";
}

function getParent(node,data){
  for(var k in data){
    if(node.data.reversion_id === data[k].parent)
      return data[k];
  }
  return "undefined";
}

//the first element is head, contains the base data of this version 
function linklist() {
  this.init = function(pData){
    this.head = new Node(pData);
    this.tail = this.head; 
    this.size = 0;
  }  

  this.insert = function (pData) {
    this.size++;
    var newNode = new Node(pData);
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
  this.getData = function (reversion_id) {
    var p = this.head;
    while (p.next != null && p.reversion_id !== reversion_id)
      p = p.next;
    return p.data;
  }

  //get node with specific dataURI 
  this.getNode = function (reversion_id) {
    var p = this.head;
    while (p.next != null && p.data.reversion_id !== reversion_id)
      p = p.next;
    return p;
  }


  //remove node with specific dataURI 
  this.removeAt = function (reversion_id) {
    this.size--;
    var p = this.head;

    while (p.next != null && p.data.reversion_id !== reversion_id) {
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
      var newNode = new Node(getParent(this.tail,array));
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