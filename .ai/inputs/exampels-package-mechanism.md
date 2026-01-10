I want to create an examples package that links the other packages in the monorepo.

However, I don't want to use yarn links. I want it to resemble a separate package as much as possible, so it should reference a package in the published npm format. But I still want everything to be local.

Given this information, come up with a workflow that fulfills the following criteria:

1. Prepares tarballs of the other packages in the published format or similar.
2. Responds to changes in the other packages and e.g. rebuild tarballs
3. The examples package will refernce the tarballs or similar format

---
