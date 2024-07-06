import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


interface ClassConstructor{
    new (...args:any[]):{}
}

export function Serialize (dto:ClassConstructor){
    return UseInterceptors(new SerializeInterceptor(dto))
}

export class SerializeInterceptor implements NestInterceptor {
    constructor(private dto:any){}
  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    // console.log('I am running bewfore the handler', context);
    return handler.handle().pipe(
      map((data: any) => {
        //run somthing before the response is sent out
        // console.log('run somthing before the response is sent out', data);
        return plainToClass(this.dto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
