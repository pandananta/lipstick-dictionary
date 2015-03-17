Tests = new (Mongo.Collection)('tests')

if Meteor.isClient
  Router.route '/', ->
    @render 'home'
    return
  Router.route '/account', ->
    @render 'account'
    return
  Router.route '/upload', ->
    @render 'submission'
    return  
  Template.body.events 'click .upload-button': ->
    UI.insert UI.render(Template.submission), document.body
    return
  
  Template.submission.events
    'change .file-picker': (event, template) ->
      file = event.currentTarget.files[0]
      reader = new FileReader
      reader.onload = (event) ->
        $(template.find('img')).attr 'src', event.target.result
        return
      reader.readAsDataURL file
      return   
    'submit .new-image': (event) ->
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
