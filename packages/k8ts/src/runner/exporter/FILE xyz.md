FILE xyz.yaml

Service _ ZZ
HttpRoute _ OtherThing
Gateway --> Gateway
Deployment _ ABC
PodTemplate _ (no name)
Volume _ Xyz
PVC --> AAA
Container _ z
Volume --> ABC : /mnt/data
Container \* y
Volume --> ABC : /mnt/data

Service/X: - @Deployment/AAA
HttpRoute/X: - @Service/X
Deployment/X:
PodTemplate:
Container/XYZ: - Own/Thing: 222 - /mnt/data --> Volume/ABC -

        Container/
          - /mnt/b: @Volume/ABC
        Volume:
          - A:
            - @Claim/AAA
          - B:
            - @Claim/XYZ

Claim/AAA:

- @Deployment/ABC

---> BackThing/Hello (backend) \* ABC/AYZ
---> OtherThing/Goodbye (service)

- Deployment/ ABC [app=x]
-   - PodTemplate [app=x]
-       * Container/ XYZ
          --> Volume/ Xyz : /mnt/data

        * Volume A
        --> AAA [PersistentVolumeClaim]

- @ N
- @ Name 3/
-      * xtz
-      *  abc
