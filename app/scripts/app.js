/*
Challenge:

Use what you've learned about Promises to request thumbnails in parallel but create them in the
proper order even if all the requests haven't finished.
 */

// Inline configuration for jshint below. Prevents `gulp jshint` from failing with quiz starter code.
/* jshint unused: false */

(function(document) {
  'use strict';

  var home = null;

  /**
   * Helper function to show the search query.
   * @param {String} query - The search query.
   */
  function addSearchHeader(query) {
    home.innerHTML = '<h2 class="page-title">query: ' + query + '</h2>';
  }

  /**
   * Helper function to create a planet thumbnail.
   * @param  {Object} data - The raw data describing the planet.
   */
  function createPlanetThumb(data) {
    var pT = document.createElement('planet-thumb');
    for (var d in data) {
      pT[d] = data[d];
    }
    home.appendChild(pT);
  }

  /**
   * XHR wrapped in a promise
   * @param  {String} url - The URL to fetch.
   * @return {Promise}    - A Promise that resolves when the XHR succeeds and fails otherwise.
   */
  function get(url) {
    return fetch(url);
  }

  /**
   * Performs an XHR for a JSON and returns a parsed JSON response.
   * @param  {String} url - The JSON URL to fetch.
   * @return {Promise}    - A promise that passes the parsed JSON response.
   */
  function getJSON(url) {
    console.log('getJSON for '+url);
    return get(url).then(function(response) {
      // For testing purposes, I'm making sure that the urls don't return in order
      if (url === 'data/planets/Kepler-62f.json') {
        return new Promise(function(resolve) {
          setTimeout(function() {
            console.log('received: ' + url);
            resolve(response.json());
          }, 500);
        });
      } else {
        console.log('received: ' + url);
        return response.json();
      }
    });
  }
  ///CLASS SOLUTION///
  ///Make the createPlanetThumb into a promise
  ///Chain the create Planet Thumbs so that the next one doesn't start until the previous one finishes
  function createPlanetThumbPromise(data) {
    return new Promise(function(resolve,reject){
      var pT = document.createElement('planet-thumb');
      for (var d in data) {
        pT[d] = data[d];
      }
      home.appendChild(pT);
      console.log('rendered '+ data.pl_name);
      resolve();
    });
  }

  window.addEventListener('WebComponentsReady', function() {
    home = document.querySelector('section[data-route="home"]');
    /*
    Your code goes here!
     */
    // getJSON('../data/earth-like-results.json').then(function(response){
    //   addSearchHeader(response.query);

    //   //send every result out first
    //   var planets = response.results.map(function(url){
    //     console.log('mapping ' + url);
    //     return getJSON(url);
    //   });

    //   var previousPlanets = Promise.resolve();
    //   planets.forEach(function(prm){//for every sent promise
    //     previousPlanets = previousPlanets.then(function(response){
    //       return prm;//add this promise to the end of the chain
    //     }).then(function(response){//and when it returns (this will be after all previous have returned, as they are all chained), create the thumbnail.
    //       console.log('creating thumb ' + response.pl_name);
    //       createPlanetThumb(response);
    //     });
    //   });
    // }).catch(function(err){
    //   console.log(err);
    // });

      getJSON('../data/earth-like-results.json').then(function(response){
          addSearchHeader(response.query);
          return response;
        }).then(function(response){

          var planets = response.results.map(function(url){
            console.log('mapping ' + url);
            return getJSON(url);
          });

          var previousPlanets = Promise.resolve();

          planets.forEach(function(request){//request is the previous promise (getJSON) for each individual request
            previousPlanets = previousPlanets.then(function(response){//add to our chain
              return request.then(createPlanetThumb);//add the resolution of 1.) our request + thenned draw to our chain
              //this is better than my solution because the create planet thumb is a promise
              // as such, the next element won't start drawing until the previous one is DONE drawing
              //whereas with my solution, it would start drawing as soon as the previous element has Started drawing?
            });
          });
      }).catch(function(err){
        console.log(err);
      });


  });
})(document);
