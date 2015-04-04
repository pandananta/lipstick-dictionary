Selfies = new (Mongo.Collection)('selfies')

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
  Template.home.helpers 
    selfies: ->
      Selfies.find {}

  Template.selfie.events
    'click .selfie': (event, template) ->
      id = event.currentTarget.id
      data = Selfies.findOne _id: id
      UI.insert UI.renderWithData(Template.selfieModal, data), document.body
  Template.selfieModal.events
    'click .modalBackdrop': (event, template) ->
      event.preventDefault()
      UI.remove template.view
      return false

  Template.submission.events
    'change .filepicker': (event, template) ->
      file = event.currentTarget.files[0]
      reader = new FileReader
      reader.onload = (event) ->
        $(template.find('img')).attr 'src', event.target.result
        return
      reader.readAsDataURL file
      return   
    'submit #new-image': (event, template) ->
      event.preventDefault()
      productTypeIndex = event.target.productType.selectedIndex
      applicationTypeIndex = event.target.applicationType.selectedIndex
      finishIndex = event.target.finish.selectedIndex
      intensityIndex = event.target.intensity.selectedIndex
      Selfies.insert
        image: $(template.find('img')).attr 'src'
        product: event.target.sku.value
        shade: event.target.shade.value
        colorCategory: event.target.colorCategory.value
        product: event.target.sku.value
        productType: event.target.productType.options[productTypeIndex].text
        applicationType: event.target.applicationType.options[applicationTypeIndex].text
        url: event.target.url.value
        price: event.target.price.value
        finish: event.target.finish.options[finishIndex].text
        intensity: event.target.intensity.options[intensityIndex].text
        createdAt: new Date
        username: Meteor.user().username
      Router.go('/')
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
