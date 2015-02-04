/**
 * Rewrite settings to be exported from the design doc
 */


module.exports = [
	{from: '/', to: 'templates/v1/embed.html'},
    {from: '/source/v1/script.js', to: 'templates/v1/script.js'},
    {from: '/source/v1/style.css', to: 'templates/v1/style.css'},
    {from: '/source/v1/embed.html', to: 'templates/v1/embed.html'},

    {from: '/source/v2/script.js', to: 'templates/v2/script.js'},
    {from: '/source/v2/style.css', to: 'templates/v2/style.css'},
    {from: '/source/v2/embed.html', to: 'templates/v2/embed.html'}    
   
];