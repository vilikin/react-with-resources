import React from 'react';
import ReactDOM from 'react-dom';
import {
  ConnectedComponent,
  ConnectionProvider,
  Request,
} from '../src';

const getOnePost = new Request({
  request: async (id) => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);

    if (!response.ok) throw response;

    return response.json();
  },
});

function renderConditionally(conditions) {
  return ({ post }) => {
    if (post.result) {
      return conditions.onResult(post.result);
    } else if (post.loading) {
      return conditions.onLoading;
    }

    return conditions.onError(post.error);
  };
}

const mapRequestsToProps = props => ({
  post: getOnePost.withParams(props.id),
});

class Index extends React.Component {
  state = {
    postId: 1,
  }

  changePostId = (e) => {
    this.setState({
      postId: e.target.value,
    });
  }

  render() {
    return (
      <ConnectionProvider>
        <div>
          Hey

          <input type="text" value={this.state.postId} onChange={this.changePostId} />

          <ConnectedComponent requests={mapRequestsToProps} id={this.state.postId}>
            {renderConditionally({
              onResult: result => (
                <div>
                  I got result: {JSON.stringify(result)}
                </div>
              ),
              onLoading: <div>Loading...</div>,
              onError: () => 'I think there is an error',
            })}
          </ConnectedComponent>
        </div>
      </ConnectionProvider>
    );
  }
}

ReactDOM.render(<Index />, document.getElementById('root'));
