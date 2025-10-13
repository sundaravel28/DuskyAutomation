module.exports = {
  default: {
    requireModule: [
      'ts-node/register'
    ],
    require: [
      'tests/steps/**/*.ts'
    ],
    paths: [
      'tests/features/**/*.feature'
    ],
    format: [
      'progress'
    ],
    publishQuiet: true,
    parallel: 1
  }
};


