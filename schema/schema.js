const graphql = require('graphql');
const axios = require('axios');

const {
  GraphQLInt,
  GraphQLString,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql;

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: ()=> ({
      id: {type: GraphQLString},
      firstname: {type: GraphQLString},
      age: {type: GraphQLString},
      company: {
        type: CompanyType,
        resolve(parentValue, args){
          return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
            .then(resp => resp.data);
        }
      }
  })
})

const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: () => ({
    id: {type: GraphQLString},
    name: {type: GraphQLString},
    description: {type: GraphQLString},
    user: {
      type: new GraphQLList(UserType),
      resolve(parentValue, args){
        return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
          .then(resp => resp.data);
      }
    }
  })
})


const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields:{
   user:  {
     type:UserType,
     args: {id: {type: GraphQLString}},
     resolve(parentValue, args){
      return axios.get(`http://localhost:3000/users/${args.id}`)
        .then(resp => resp.data);
      }
    },
    users: {
      type: new GraphQLList(UserType),
      resolve(parentValue,args){
        return axios.get(`http://localhost:3000/users`)
          .then(resp => resp.data);
      }
    },
    company: {
      type: CompanyType,
      args: {id: {type: GraphQLString}},
      resolve(parentValue, args){
        return axios.get(`http://localhost:3000/companies/${args.id}`)
          .then(resp => resp.data);
      }
    }
  }
});

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUsers: {
      type: UserType,
      args: {
        firstname: {type: new GraphQLNonNull(GraphQLString)},
        age: {type: new GraphQLNonNull(GraphQLString)},
        companyId: {type: GraphQLString}
      },
      resolve(parentValue, {firstname, age, companyId}){
        return axios.post(`http://localhost:3000/users`,{firstname, age, companyId})
          .then(resp => resp.data);
      }
    },
    deleteUser: {
      type: UserType,
      args: {id: {type: GraphQLString}},
      resolve(parentValue, args){
        return axios.delete(`http://localhost:3000/users/${args.id}`)
          .then(resp => resp.data);

      }
    },
    editUser: {
      type: UserType,
      args: {
        id: {type: GraphQLString},
        firstname: {type: GraphQLString},
        age: {type: GraphQLString},
        companyId: {type: GraphQLString}
      },
      resolve(parentValue, args){
        return axios.patch(`http://localhost:3000/users/${args.id}`, {args})
          .then(resp => resp.data);
      }
    }
  }
})


module.exports = new GraphQLSchema({
  query : RootQuery,
  mutation
});
