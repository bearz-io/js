# @bearz/di

## Overview

Dependency injection for the primary use case of managing globals, factories, and switching out
providers or using multiple named providers. 

JavaScript's limited type system doesn't lend itself to traditional dependency injection
with interfaces.  While you can do it with abstract classes, one is better off with a 
key based approach. 



## Notes

This module was created primarily to handle global singletons, factories, and providers/drivers
where there are different implementations for an interface/abstract class.  It does support creating
scoped instances.  The use case was enable a tool called rex to have multiple providers for different
things like secret vaults and managing dns records.  

Rex allows for multiple providers to be used in a single workflow to handle various infrastructure needs.
For example, you may need to retrieve multiple secrets from different secret vaults. 

The goal of this module is really to simplify managing the singltons, factories, and proviers.

It does not exist to replicate more traditional DI found in other languages.