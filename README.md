# GitLapse

Time lapse the design of your project. Will generate screenshots within a given range of commits, and run your setup script between each one to ensure the dependencies are always inline.

## Example usage

To run the example, ensure you have cloned the repo with submodules, as the tests rely on a seperate repo to ensure we're checking out revisions correctly.

Once you've done that, you can hit the following:

```sh
./bin/gitlapse --start-commit=932ad002c1d98b9704efed2f860f1a6e1a7b0e9d --end-commit=513b6013019185fd968b29db0058daf2215c8064 --repo="./test/fixtures/gitlapse-test"
```

## Options

<table>
  <thead>
    <tr>
      <th>Option</th>
      <th>Default Value</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>start-commit</th>
      <td>
<pre>Commit SHA</pre>
      </td>
      <td>The SHA of the first commit you want to capture.</td>
    </tr>
    <tr>
      <th>end-commit</th>
      <td>
<pre>Commit SHA</pre>
      </td>
      <td>TThe SHA of the last commit you want to capture.</td>
    </tr>
    <tr>
      <th>steps</th>
      <td>
<pre>1</pre>
      </td>
      <td>The number of commits to 'jump' by after each screenshot. If your project has been around for a while, you'll want to bump this up. Essentially this is the resolution of the time lapse.</td>
    </tr>
    <tr>
      <th>repo</th>
      <td>
<pre>./</pre>
      </td>
      <td>The relative path to the repository you're working with. Usually this'll just be the current working directory.</td>
    </tr>
    <tr>
      <th>setup</th>
      <td>
<pre>config/setup.sh</pre>
      </td>
      <td>The relative path to your setup script.<br>
      This will run after each revision is checked out.<br>
      Typically this is bash script that will clear your `node_modules` directory and then run `npm install` or `bundle` afterwards. </td>
    </tr>
    <tr>
      <th>server</th>
      <td>
<pre>config/server.sh</pre>
      </td>
      <td>The relative path to your 'start server' script.<br>
      This will run after each revision is checked out.<br>
      Put the command in this file to start your server. E.g `node app.js` or `rails s`. </td>
    </tr>
    <tr>
      <th>url</th>
      <td>
<pre>http://localhost:8080</pre>
      </td>
      <td>The URL for where the local server will be running. This is what will be viewed for the screenshot captures.</td>
    </tr>
    <tr>
      <th>output</th>
      <td>
<pre>./dist</pre>
      </td>
      <td>The relative directory for where you want the time lapse to be output.</td>
    </tr>
    <tr>
      <th>width</th>
      <td>
<pre>1280</pre>
      </td>
      <td>The width of the browser window to capture the screenshot at.</td>
    </tr>
    <tr>
      <th>height</th>
      <td>
<pre>800</pre>
      </td>
      <td>The height of the browser window to capture the screenshot at.</td>
    </tr>
    <tr>
      <th>silent</th>
      <td>
<pre>false</pre>
      </td>
      <td>Disable console logging during generation.</td>
    </tr>
</tbody>
</table>
