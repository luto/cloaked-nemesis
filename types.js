require("./simple-inheritance.js");

exports.t_Entity = Class.extend({
      id: 0,
       x: 0,
       y: 0,
  height: 0,
   width: 0,
    init: function (id)
      {
        this.id = id;
        this.__type = "t_Entity";
      }
});

exports.t_Player = exports.t_Entity.extend({
  color: null,
   name: null,
  alive: true,
  score: 0,
   init: function (id)
     {
       this._super(id);
       this.__type = "t_Player";
       this.height = 50;
       this.width = 50;
       this.color = "#000";
       this.alive = true;
       this.score = 0;
     }
});

exports.getObj = function(type, props)
{
  var obj = new (this[type]);
  for(var prop in props)
    obj[prop] = props[prop];
  return obj;
}
