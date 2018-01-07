const graphql = require('graphql');
const axios = require('axios');

const {
  GraphQLInt,
  GraphQLString,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLList
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
          console.log(parentValue, args);
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
     type: UserType,
     args: {id: {type: GraphQLString}},
     resolve(parentValue, args){
      return axios.get(`http://localhost:3000/users/${args.id}`)
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


module.exports = new GraphQLSchema({
  query : RootQuery
});
