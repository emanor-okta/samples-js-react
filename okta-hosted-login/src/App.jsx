/*
 * Copyright (c) 2018, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import React from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import { Security, SecureRoute, LoginCallback } from '@okta/okta-react';
import { Container } from 'semantic-ui-react';
import config from './config';
import Home from './Home';
import Messages from './Messages';
import Navbar from './Navbar';
import Profile from './Profile';
import OidcCompliant from './OidcCompliant';
import CorsErrorModal from './CorsErrorModal';

const oktaAuth = new OktaAuth(config.oidc);

const App = () => {
  const [corsErrorModalOpen, setCorsErrorModalOpen] = React.useState(false);
  const history = useHistory();
  const restoreOriginalUri = async (_oktaAuth, originalUri) => {
    history.replace(toRelativeUrl(originalUri || '/', window.location.origin));
  };

  oktaAuth.session.exists()
    .then((exists) => {
      if (exists) {
        oktaAuth.token.getWithoutPrompt({
          responseType: ['id_token', 'token'],
        })
          .then((res) => {
            oktaAuth.tokenManager.setTokens(res.tokens);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });

  return (
    <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
      <Navbar {...{ setCorsErrorModalOpen }} />
      <CorsErrorModal {...{ corsErrorModalOpen, setCorsErrorModalOpen }} />
      <Container text style={{ marginTop: '7em' }}>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/login/callback" component={LoginCallback} />
          <SecureRoute path="/messages" component={Messages} />
          <SecureRoute path="/profile" component={Profile} />
          <Route path="/okta/initiated" component={OidcCompliant} />
        </Switch>
      </Container>
    </Security>
  );
};

export default App;
