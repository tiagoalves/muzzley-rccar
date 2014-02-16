var config = {
  connection: {
    token: 'c1a8d6f2f96b540c', // Muzzley App Token (generate your own at www.muzzley.com)
    // Generate your own static Muzzley Activity Id in your app's view at www.muzzley.com as well.
    // A static activity id helps you always know what Activity Id your RC Car will have since
    // you probabily won't have a display to show the generated Activity Id.
    activityId: 'generate-your-own-static-id'
  },

  // Kick a user that is considred idle? Either `false` to never kick users or a time in ms
  inactivityTimeout: 60000

};

exports = module.exports = config;