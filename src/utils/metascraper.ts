// import fetch from 'node-fetch';
// import metascraperBase from 'metascraper';
// import metascraperTitle from 'metascraper-title';
//
// const metascraper = metascraperBase([metascraperTitle()])
import axios from 'axios'

const metascraper = require('metascraper')([
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-logo-favicon')(),
  // require('metascraper-clearbit')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')(),
]);

export const fetchMetadataForUrl = async (targetUrl: string) => {
  const response = await axios.get(targetUrl);
  return await metascraper({ html: response.data, url: targetUrl });
};
