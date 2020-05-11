# React Endless Scroller

## About

React Endless Scroller is a useful component to quickly create an infinite scroll element, with minimal backend API requirements and easy frontend declaration.

It comes in two components : a high level one, with some pre-built visual handlers, and a more low level one, for deeper integration and customization.

## Components

+ **[EndlessScrollHandler (low level)](#endlessscrollhandler-low-level)**
    + [Minimal example](#minimal-example)
    + [Full props example](#full-props-example)
    + [Overview](#overview)
    + [Inputs](#inputs)
    + [Outputs (props)](#outputs-props)
        + [endlessScroll.params](#endlessscrollparams)
        + [⚠️ endlessScroll.mutateState](#-endlessscrollmutatestate)
        + [endlessScroll.updateQueryParams](#endlessscrollupdatequeryparams)
        + [endlessScroll.removeTuples](#endlessscrollremovetuples)
        + [endlessScroll.insertTuples](#endlessscrollinserttuples)
        + [endlessScroll.onScroll](#endlessscrollonscroll)
        + [endlessScroll.search](#endlessscrollsearch)
+ **[Copyright](#copyright)**

## EndlessScrollHandler (low level)

### Minimal example

For how to build the backendApi, please refer to <a href="https://github.com/Kushuh/react-endless-scroller/blob/master/APISPECSHEET.md">this specsheet</a>.

*Wrapper.jsx*
```jsx
import React from 'react';
import Container from 'path/to/container';
import backendApi from 'path/to/api';

const Wrapper = () => {
  //...

  return (
    <EndlessScrollHandler api={backendApi}>
        <Container/>
    </EndlessScrollHandler>
  );
};

export default Wrapper;
```

*Container.jsx*
```jsx
import React from 'react';
import Tuple from 'path/to/tuple';
import SearchBar from 'path/to/searchbar';

const Container = ({endlessScroll, ...props}) => {
  //...
  
  return (
    <div onScroll={endlessScroll.onScroll}>
    
        {endlessScroll.params.results.map(
          // Each result should contain a unique key attribute and use it 
          // as an id. The key attribute is reserved by React, and should
          // also be declared here.
          ({key, ...tuple}) => <Tuple id={key} key={key} {...tuple}/>)
        }
    
    </div>
  );
};

export default Container;
```

### Full props example

*Wrapper.jsx*
```jsx
import React from 'react';
import Container from 'path/to/container';
import backendApi from 'path/to/api';

const Wrapper = () => {
  //...

  return (
    <EndlessScrollHandler
      api={backendApi}
      packetSize={30}
      loadSize={120}
      bypassLoadSize={false}
      inRushLoad={true}
      inRushLoadSize={60}
      deferLaunch={false}
      loadThreshold={{top: 100, bottom: 100}}
      errorHandler={error => console.error(error)}
      initialProps={{
      	boundaries: {start: 50, end: 52},
        flags: {endOfResults: true},
        results: [
          {key: 'element-50', foo: 'bar'},
          {key: 'element-51', foo: 'bar2'}
        ]
      }}
      queryParams={{
        search: 'blue jeans',
        filter: {price: [15 - 50]}
      }}
      postLoadAction={result => {
        console.log('fetch successful !', result.flags.endOfResults);
      }}
    >
        <Container/>
    </EndlessScrollHandler>
  );
};

export default Wrapper;
```

### Overview

The EndlessScrollHandler wraps a page component, and pass some useful props to it, to easily feed user with infinite content.

The component will handle the network calls, based on the current scroll position in the scrollable element that handles the tuples.

### Inputs

| key | type | required | default | description |
| :---: | :---: | :---: | :---: | :--- |
| api | (object) => Promise\<object\> | true | undefined | The api has to comply with the <a href="https://github.com/Kushuh/react-endless-scroller/blob/master/APISPECSHEET.md">component Api Specsheet</a>.<br />The api should use an index based pagination. |
| packetSize | number<br />1 < n | false | 30 | The maximum number of tuples to load on each fetch. |
| loadSize | number<br />3 < n && 1.5 * packetSize <= n | false | 120 | The maximum number of tuples to keep in the DOM.**(1)** |
| ⚠️ bypassLoadSize | boolean | false | false | Disable the content limit to load in the DOM.**(2)** |
| inRushLoad | boolean | false | true | Force bigger loads when their is not enough content on the wall. |
| inRushLoadSize | number<br/>1 < n | false | 60 | When inRushLoad is active, determine the amount of data to load instead of packetSize. |
| deferLaunch | boolean | false | false | Disable the initial fetch launched by the component when mounted.**(3)** |
| loadThreshold.top | number<br/> 0 <= n | false | 1 | Distance in pixel from top, when a new backward fetch has to be triggered.**(4)** |
| loadThreshold.bottom | number<br/> 0 <= n | false | 1 | Distance in pixel from bottom, when a new forward fetch has to be triggered.**(4)** |
| errorHandler | Function | false | undefined | A function that is called each time an error occurs inside the component. |
| initialProps | object | false | undefined | Override some initial state parameters.**(5)** |
| queryParams | any | false | object | Additional parameters to send to the api for fetches. |
| postLoadAction | Function | false | undefined | Is triggered after each successful fetch. |

**(1)** This prop default value can be overridden with the bypassLoadSize flag.

**(2)** Be careful this should be used only for development purposes, as it can harm both memory and performances with large datasets.

**(3)** If you use the deferLaunch flag, you'll have to trigger the first fetch manually. This can be done using the `endlessScroll.search()` function, passed to the container props.

**(4)** By default, the component will wait for the user to scroll to one of the page limits to trigger fetch (either backward or forward). However, for a smoother user experience, and a better "infinite" sensation, it is advised to add larger thresholds. Thus, fetch will be called earlier and lower the "wait for load" impression.<br/>
Larger thresholds means new content will always be loaded before user reach the limit, until none is left.

**(5)** Boundaries, flags and results can be overridden.

### Outputs (props)

The component adds the following parameters to children, under the `endlessScroll` props.

#### endlessScroll.params

A snapshot of the current component state.

| key | type | description |
| :---: | :---: | :--- |
| results | Array<object> | A list of the currently loaded tuples.**(1)** |
| flags.beginningOfResults | boolean | Indicate if results are still left in backward fetch mode (before the first result). |
| flags.endOfResults | boolean | Indicate if results are still left in forward fetch mode (after the last result). |
| boundaries.start | number | The dataset index of the first tuple. |
| boundaries.end | number | The dataset index of the last tuple. |
| error | Error | The last and still valid error that occured in the component, typically during fetch. It is set back to null each time a new action is taken. |
| loading | boolean | Set to true if a fetch operation is ongoing. |
| empty | boolean | Set to true if no results were returned, and both beginningOfResults and endOfResults have been set to true. |
| launched | boolean | Set to true once the component has trigger a successful fetch. |
| queryParams | object | See [props](#inputs). |

**(1)** Each tuple is an object, that has to contain at least a unique key attribute.

#### ⚠️ endlessScroll.mutateState

Mutate the parent state. If no parameters are being passed, it will reset the parent state with some default parameters.

```jsx
// Update query params.
mutateState({queryParams: someParams});

// Reset the state to a default state.
mutateState();
```

Above are the parameters of the default state. Any absent parameter will remain untouched.

```jsx
{
    results: [],
    boundaries: {
        start: 0,
        end: 0
    },
    loading: false,
    flags: {
        beginningOfResults: true,
        endOfResults: false
    },
    empty: false,
    error: null,
    launched: false
}
```

⚠️ This function has minimal guard control and can lead to unwanted behaviors. If you just need to update queryParams, please refer to the updateQueryParams prop above.

#### endlessScroll.updateQueryParams

Update query parameters for the api.

```jsx
updateQueryParams(someParams);
```

#### endlessScroll.removeTuples

Remove a list of tuple ids from the current list. Tuples are represented by their unique key attribute.

```jsx
// scrollableElementRef is optional. If omitted, set it to false,
// as the first parameter will automatically be attributed to it.
removeTuples(scrollableElementRef, tupleId1, tupleId2, ...);
```

ℹ️ scrollableElementRef force a second refresh of the page status after the first fetch. It can be useful, for example, on very large screens, where a load doesn't always fill the whole window space, thus letting some room for an extra fetch.

#### endlessScroll.insertTuples

Insert a list of tuples in the current list. New tuples have each to contain a unique key attribute.

```jsx
// scrollableElementRef is optional. If omitted, set it to false,
// as the first parameter will automatically be attributed to it.
insertTuples(scrollableElementRef, tuples, index);
```

ℹ️ insert takes an extra index attribute, to tell the component where to insert the new tuples.

#### endlessScroll.onScroll

Scroll handler to add to the scrollable container. It is responsible for triggering api fetches.

```jsx
onScroll(event);
```

#### endlessScroll.search

Search function. A search will reset the component state (mutateState with empty parameters), then repopulate tuples with an updated fetch.

```jsx
search();
```

## Copyright
2020 Kushuh - MIT license