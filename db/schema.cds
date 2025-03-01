namespace cap.embedding.function;
using { cuid, managed } from '@sap/cds/common';

entity Dummy {
  key id : Integer;
}

entity Notes: cuid, managed {
  note: LargeString;
  embedding: Vector(768);
}