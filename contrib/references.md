The referencing system is a bit of a mess but here's how it works in general.

# What's it for

1. It drastically improves compilation times.
2. External resources
3. Forward references

## 1. compilation times
The full resource types are extremely large. If we use them as part of signatures that involes a lot of TypeScript computation. By reducing the size of the type, we allow TypeScript to do less checks. While someone could replace our valid resources with minimal copies, this isn't likely in practice.

## 2. External resources
External resources expose minimal functionality as objects but can be of any type. Using minimal resource types lets the code that relies on them not to assume that the full object exists.

## 3. Delayed resources
Same as (2), it encourages code to avoid doing things that would resolve the FwReference permaturely
