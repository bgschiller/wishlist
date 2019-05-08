const { Forbidden } = require('@feathersjs/errors');
// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

const defaultOptions = {
  getModelId: (ctx) => ctx.id,
  modelProp: 'user_id',
};

module.exports = function (options = {}) {
  return async context => {
    options = Object.assign({}, defaultOptions, options);
    const modelId = await options.getModelId(context);
    const model = await context.service.get(modelId);
    const loggedInUserId = context.params.user.id;
    if (model[options.modelAttribute] !== loggedInUserId) {
      throw new Forbidden("Only the owner can take this action");
    }
    return context;
  };
};
