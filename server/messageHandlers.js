module.exports = function (messages) {
  return {
		getMessages: function (req, res, next) {
	    if(req.params.id) {
        messages.findById(req.params.id, function (err, message) {
          if (err) {
            console.log(err);
            res.send(500);  
          } 
          res.send(message);
        });
	    } else {
        messages.find().sort('-date').execFind(function (err, data) {
          if (err) {
            console.log(err);
            res.send(500);  
          } 
          res.send(data);
        });
	    }
		},
		postMessage: function (req, res, next) {
	    if(req.params.id) {  // update existing
        // TODO: consider using update()
        messages.findById(req.params.id, function (err, message) {
          if (err) {
            console.log(err);
            res.send(500);  
          } 
          if (message) {
            message.message = req.params.message;
            message.save(function (err, savedMessage) {
              if (err) {
                console.log(err);
                res.send(500);  
              } 
              console.log('Updated message ' + savedMessage._id);
              res.send(200);
            });
          } else {
              res.send(404);
          }
        });
	    } else { // create new
        var m = { 
          message: req.params.message, 
          date: new Date() 
        };
        messages.create(m, function(err, message) {
          if (err) {
            console.log(err);
            res.send(500);  
          }
          console.log('Created a new message, id: ' + message._id);
          res.send(req.body);
        });
	    }
		},
		deleteMessage: function (req, res, next) {
	    messages.findById(req.params.id, function (err, message) {
        if (err) {
          console.log(err);
          res.send(500);  
        } 
        if (message) {
          var id = message._id;
          message.remove(function (err, removed) {
            if (err) {
              console.log(err);
              res.send(500); 
            }
            console.log('Removed message ' + id);
            res.send(204);
          });
        } else {
            res.send(404);
        }
	    });
		}
	}
}