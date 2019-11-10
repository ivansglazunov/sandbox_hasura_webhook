import _ from 'lodash';
import passport from 'passport';
import express from 'express';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import gql from 'graphql-tag';
import ApolloClient from 'apollo-client';

import { selectNodeIdByString } from './gql';
import { generateApolloClient } from './apollo-client';

require('dotenv').config();

const envErrors = [];
if (!process.env.GQL_SECRET) envErrors.push('!GQL_SECRET');
if (!process.env.GQL_PATH) envErrors.push('!GQL_PATH');
if (!process.env.PORT) envErrors.push('!PORT');
if (envErrors.length) throw new Error(envErrors.toString());

const app = express();

app.set('json spaces', 2); // number of spaces for indentation
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((auth, done) => {
  done(null, auth.token);
});

passport.deserializeUser(async (token, done) => {
  try {
    const nodeId = await selectNodeIdByString({
      apolloClient,
      format: 'txt',
      type: 'auth_token',
      value: token,
    })
    done(null, { token, nodeId });
  } catch(error) {
    done(error);
  }
});

const apolloClient = generateApolloClient({}, {
  path: _.get(process, 'env.GQL_PATH'),
  secret: _.get(process, 'env.GQL_SECRET'),
});

export const ANONYMOUS_USER_ID = 'anonymous';

passport.use(
  new BearerStrategy(async (token, done) => {
    try {
      const nodeId = await selectNodeIdByString({
        apolloClient,
        format: 'txt',
        type: 'auth_token',
        value: token,
      });
      console.log('BearerStrategy', { token, nodeId });
      if (!nodeId) return done('!nodeId');
      return done(null, { token, nodeId });
    } catch(error) {
      console.log('BearerStrategy', { error });
      done(error);
    }
  }),
);

app.get(
  '/', 
  (req, res, next) => {
    console.log('bearer1', req.url);
    passport.authenticate('bearer', (error, user, info) => {
      console.log('bearer2', error, user);
      if (error) {
        return res.status(401).json({ error: error.toString() });
      }
      if (user) {
        res.status(200).json({
          'X-Hasura-Role': 'user',
          'X-Hasura-User-Id': `${user.nodeId}`,
        });
      } else {
        res.status(200).json({
          'X-Hasura-Role': 'anonymous',
          'X-Hasura-User-Id': `${ANONYMOUS_USER_ID}`,
        });
      }
    })(req, res, next);
  },
);

app.listen(process.env.PORT);
