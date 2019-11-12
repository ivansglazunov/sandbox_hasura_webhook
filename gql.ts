import _ from 'lodash';
import gql from "graphql-tag";
import uniqid from 'uniqid';

// select node id by some string

export const SELECT_NODE_ID_BY_STRING = gql`
query SELECT_NODE_ID_BY_STRING($format: String, $type: String, $value: String) {
  links(where: {links_props_strings: {format: {_eq: $format}, type: {_eq: $type}, value: {_eq: $value}}}) {
    id
  }
}
`;

export const selectNodeIdByString = async ({
  apolloClient, format, type, value,
}: {
  apolloClient: any, format: string, type: string, value: string,
}) => {
  console.log({ format, type, value, });
  const r0 = await apolloClient.query({
    query: SELECT_NODE_ID_BY_STRING,
    variables: { format, type, value, },
  });
  console.log(r0.data);
  return _.get(r0, 'data.links.0.id');
};
