Tests = new Mongo.Collection("tests");

if (Meteor.isClient) {
  Template.body.helpers({
  	tests: function () {
      return Tests.find({});
    }
  });

  Template.body.events({
	  "click .upload-button": function () {
	   	UI.insert(UI.render(Template.submission), document.body);
	  }
	});

  Template.submission.events({
	  "submit .new-image": function (event) {
	    event.preventDefault();

	    Tests.insert({
	    	product: event.target.sku.value,
			  createdAt: new Date(),            
			  owner: Meteor.userId(),          
			  username: Meteor.user().username  
			});
	  }
	});

	Accounts.ui.config({
	  passwordSignupFields: "USERNAME_ONLY"
	});
}

