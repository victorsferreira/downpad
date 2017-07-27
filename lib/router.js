FlowRouter.route('/blog/:postId', {
    action: function(params, queryParams) {
        console.log("Yeah! We are on the post:", params.postId);
    }
});

FlowRouter.route('/lists/:_id', {
  name: 'Lists.show',
  action() {
    mount(AppContainer, {
      main: <ListPageContainer/>,
    });
  },
});
