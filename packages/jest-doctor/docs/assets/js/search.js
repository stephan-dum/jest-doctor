/* eslint-disable no-undef */

const searchClient = algoliasearch(
  '5DXOBHA2ZD',
  'cbbe74e664008bf002e0f6edcc0942ee',
);

const search = instantsearch({
  indexName: 'stephan_dum_github_io_5dxobha2zd_pages',
  searchClient,
});

search.addWidgets([
  instantsearch.widgets.searchBox({
    container: '#search-box',
    placeholder: 'Search the docs…',
    cssClasses: {
      root: 'search-box', // adds a wrapper class for styling
    },
  }),

  instantsearch.widgets.hits({
    container: '#search-hits',
    templates: {
      item(hit, { html, components }) {
        return html` <article>
          <a href="${hit.url}">
            <h2>${components.Highlight({ attribute: 'title', hit })}</h2>
            <p>${components.Snippet({ attribute: 'content', hit })}</p>
          </a>
        </article>`;
      },
    },
    cssClasses: {
      root: 'search-hits',
    },
  }),
]);

search.start();
