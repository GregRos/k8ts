FILE xyz.yaml

Service     * ZZ
HttpRoute      * OtherThing
Gateway          --> Gateway
Deployment  * ABC
PodTemplate     * (no name)
Volume             * Xyz
PVC                   --> AAA
Container          * z
Volume                --> ABC : /mnt/data
Container          * y
Volume                --> ABC : /mnt/data


Service/X:
    - @Deployment/AAA
HttpRoute/X:
    - @Service/X
Deployment/X:
    PodTemplate: 
        Container/XYZ:
          - Own/Thing: 222
          - /mnt/data --> Volume/ABC
          - 
            
        Container/
          - /mnt/b: @Volume/ABC
        Volume:
          - A:
            - @Claim/AAA
          - B:
            - @Claim/XYZ
Claim/AAA:
- @Deployment/ABC



---> BackThing/Hello (backend)
     * ABC/AYZ
     ---> OtherThing/Goodbye (service)
* Deployment/ ABC [app=x]
*   * PodTemplate [app=x]
*       * Container/ XYZ
          --> Volume/ Xyz : /mnt/data

        * Volume A
        --> AAA [PersistentVolumeClaim]

*   @ N
*   @ Name 3/
*      * xtz
*      *  abc
