import * as t from "babel-types";
var parseFixture = require('./helpers')


describe('parsing Components', () => {

  var propMetaData = {
        'aria-property': {
          type: { name: 'string' },
          required: false,
          desc: '',
          computed: false,
          defaultValue: '\'aria-value\''
        },
        objProp: {
          type: { name: 'object' },
          required: false,
          desc: 'An object hash of field errors for the form.'
        },
        reqProp:{
          type: { name: 'object' },
          required: true,
          desc: ''
        },
        funcProp: {
          type: { name: 'func' },
          required: false,
          desc: 'Callback **that** is called when a validation error occurs.',
          computed: true,
          defaultValue: '(path, model) => getter(path)(model)'
        },
        stringProp: {
          type: { name: 'string' },
          required: false,
          desc: '',
          computed: false,
          defaultValue: '\'form\''
        },
        boolProp: {
          type: { name: 'bool' },
          required: false,
          desc: '',
          computed: false,
          defaultValue: 'true'
        },
        enumProp: {
          type: {
            name: 'enum',
            value: ['true', '\'john\'', '5', 'null', 'Infinity'],
          },
          required: false,
          desc: ''
        },

        otherProp: {
          type: { name: 'Message' },
          required: false,
          desc: ''
        },

        shapeProp: {
          type: {
            name: 'object',
            value: {
              setter: { type: { name: 'func' }, required: false, desc: '' },
              name:   { type: { name: 'string' }, required: false, desc: '' }
            }
          },
          required: false,
          desc: '',
          computed: true,
          defaultValue: '{ setter: ()=>{}, name: \'John\' }'
        },

        unionProp: {
          type: { name: 'union', value: [{ name: 'func' }, { name: 'string' }] },
          required: false,
          desc: ''
        },

        reqUnionProp: {
          type: { name: 'union', value: [{ name: 'func' }, { name: 'string' }] },
          required: true,
          desc: ''
        },

        customProp:  {
          type: { name: 'custom' },
          required: false,
          desc: ''
        },

        customIdentifier:  {
          type: { name: 'someValidator' },
          required: false,
          desc: ''
        },

        customCallExpression:  {
          type: { name: 'someValidator' },
          required: false,
          desc: ''
        }
      }

  it('should resolve createClass', () => {
    parseFixture('create-class').should.eql({
      ClassicComponent: {
        desc: 'Description of my Component',
        props: propMetaData,
        methods: {},
        composes: []
      }
    })
  })

  it('should resolve class syntax', () => {
    parseFixture('class-assigned').should.eql({
      AssignedComponent: {
        desc: 'Description of my Component',
        props: propMetaData,
        methods: {},
        composes: []
      }
    })
  })

  it('should resolve class syntax with static initializers', () => {
    parseFixture('class-static').should.eql({
      StaticComponent: {
        desc: 'Description of my Component',
        props: propMetaData,
        methods: {},
        composes: []
      }
    })
  })

  it('should resolve classes with render methods', () => {
    parseFixture('infer', { inferComponent: true }).should.eql({
      InferedComponent: {
        desc: '',
        composes: [],
        methods: {},
        props: {
          objProp: propMetaData.objProp
        }
      }
    })
  })

  it('should resolve mixins', () => {
    parseFixture('mixins', { mixins: true }).should.eql({
      MyMixin: {
        desc: 'Description of my Component',
        props: propMetaData,
        methods: {},
        mixin: true,
        composes: []
      }
    })
  })

  it('should custom mixin criteria', () => {
    function isMixin(node) {
      return t.isVariableDeclarator(node)
          && node.id.name.toLowerCase().indexOf('mixout') !== -1
    }

    parseFixture('mixins', { mixins: true, isMixin }).should.eql({
      MyMixout: {
        desc: 'Description of my Component',
        props: propMetaData,
        methods: {},
        mixin: true,
        composes: []
      }
    })
  })

  it('should resolve to binding', () => {
    var props = {
      prop: {
        type: { name: 'string' },
        required: false,
        desc: 'prop description',
        computed: false,
        defaultValue: '\'hi!\''
      }
    }

    parseFixture('resolve').should.eql({
      ClassicComponent: {
        desc: '', props,
        methods: {},
        composes: []
      },

      ES6Component: {
        desc: '', props,
        methods: {},
        composes: []
      }
    })
  })

  it('should resolve to module', () => {
    parseFixture('resolve-module').should.eql({
      ClassicComponent: {
        desc: '', props: {},
        methods: {},
        composes: []
      },

      ES6Component: {
        desc: '', props: {},
        methods: {},
        composes: []
      },

      GlobalComponent: {
        desc: '', props: {},
        methods: {},
        composes: []
      }
    })
  })

  it('should resolve to either', () => {
    parseFixture('resolve-mod-or-component').should.eql({
      ClassicComponent: {
        desc: '', props: {},
        methods: {},
        composes: []
      },

      ES6Component: {
        desc: '', props: {},
        methods: {},
        composes: []
      },

      GlobalComponent: {
        desc: '', props: {},
        methods: {},
        composes: ['ES6Component', 'ClassicComponent']
      }
    })
  })

  it('should detect composition', () => {
    var props = {
          prop: {
            desc: '',
            required: false,
            type: {
              name: 'string'
            }
          }
        }

    parseFixture('composes', { mixins: true }).should.eql({
      ClassicComponent: {
        desc: '', props: props,
        methods: {},
        composes: ['Other'],
        mixins: ['MyMixin']
      },

      ES6Component: {
        desc: '', props: props,
        methods: {},
        composes: ['Other']
      },

      ES7Component: {
        desc: '', props: props,
        methods: {},
        composes: ['Other', 'ES6Component']
      }
    })
  })

  it('should handle defaultProp spread', () => {

    parseFixture('defaultPropSpread', { mixins: true }).should.eql({
      Component: {
        desc: '',
        composes: ['Component'],
        methods: {},
        props: {
          prop: {
            computed: false,
            defaultValue: "'boom'",
          },
          anotherProp: {
            computed: true,
            defaultValue: '()=>{}',
          },
        }
      }
    })
  })

  // it('should parse method data', () => {
  //   parseFixture('methods').should.eql({
  //     // ES6Component: {
  //     //   desc: '',
  //     //   props: {},
  //     //   composes: [],
  //     //   methods: {
  //     //     foo: {
  //     //       desc: 'this is foo()'
  //     //     }
  //     //   }
  //     // }
  //     ClassicComponent: {
  //       desc: '',
  //       props: {},
  //       composes: [],
  //       methods: { "bar": { } }
  //     }
  //   })
  // })
})
