const assert=require("assert");
const {WordDarkLocalLibrary}=require("./../library/local-library");
const {WordDarkCentralLibrary}=require("./../library/central-library");
const {WordDarkHierarchicalLibrary}=require("./../library/hierarchical-library");

const earth=new WordDarkLocalLibrary({libraryId:"LIB-EARTH",ownerId:"world/earth",parentId:"WORDDARK"});
const sky=new WordDarkLocalLibrary({libraryId:"LIB-SKY",ownerId:"world/sky",parentId:"WORDDARK"});
const central=new WordDarkCentralLibrary();
const hierarchy=new WordDarkHierarchicalLibrary({centralLibrary:central});
hierarchy.registerSector("LIB-EARTH",earth);
hierarchy.registerSector("LIB-SKY",sky);

const detail=hierarchy.save("LIB-EARTH",{recordId:"R1",type:"DETAIL",data:{secretDetail:"fica na Terra"}});
assert.strictEqual(earth.get("R1").data.secretDetail,"fica na Terra");
assert.strictEqual(central.count(),0);

hierarchy.summarize({libraryId:"LIB-EARTH",record:detail,type:"SECTOR_INDEX",data:{status:"ACTIVE"}});
assert.strictEqual(central.count(),1);
assert.strictEqual(central.get("INDEX-LIB-EARTH-R1").detailRecordId,"R1");
assert.strictEqual(central.get("INDEX-LIB-EARTH-R1").summary.status,"ACTIVE");

console.log("Hierarchical library audit: OK");
