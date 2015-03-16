Tests = new (Mongo.Collection)('tests')

if Meteor.isClient  
  Template.body.events 'click .upload-button': ->
    UI.insert UI.render(Template.submission), document.body
    return
  
  Template.submission.events 'submit .new-image': (event) ->
    event.preventDefault()
    Tests.insert
      product: event.target.sku.value
      createdAt: new Date
      owner: Meteor.userId()
      username: Meteor.user().username
    return
  
  Accounts.ui.config
    requestPermissions: facebook: [ 'public_profile' ]
    passwordSignupFields: 'USERNAME_ONLY'

if Meteor.isServer
	Accounts.onCreateUser( (options, user) ->
    options.profile = {} unless options.profile
    options.profile.skinTone = 3
    options.profile.concern = "multi tone"
    options.profile.hairColor = "black"
    options.profile.eyeColor = "black"
    user.profile = options.profile if options.profile
    user)
