import { Directive, ElementRef, EventEmitter, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { auditTime, fromEvent, Subject, takeUntil } from 'rxjs';

type Position = 'above' | 'below';

@Directive({
  selector: '[appPosition]'
})
export class PositionDirective implements OnInit, OnDestroy {

  private destroyed = new Subject<void>();

  currentPosition?: Position;

  @Output()
  positionChange: EventEmitter<Position> = new EventEmitter<Position>();

  constructor(private elementRef: ElementRef<HTMLElement>) {
  }

  ngOnInit() {
    this.currentPosition = this.getPosition();
    this.positionChange.emit(this.currentPosition);
    this.listenForPositionChange();
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  listenForPositionChange() {
    return fromEvent(window, 'scroll').pipe(takeUntil(this.destroyed)).subscribe(() => {
      const newPosition = this.getPosition();
      if (this.currentPosition != newPosition) {
        this.currentPosition = newPosition;
        this.positionChange.emit(this.currentPosition);
      }});

    // this.ngZone.runOutsideAngular(() => {
    //     return fromEvent(window, 'scroll').subscribe(() => {
    //       const newPosition = this.getPosition();
    //       if (this.currentPosition != newPosition) {
    //         this.currentPosition = newPosition;
    //         this.ngZone.run(() => this.positionChange.emit(this.currentPosition));
    //       }
    //     });
    //   }
    // )

  }

  getPosition() {
    return getElementPositionRelativeToViewportTop(this.elementRef.nativeElement);
  }
}

function getElementPositionRelativeToViewportTop(element: HTMLElement) {
  return element.getBoundingClientRect().y > 0 ? 'below' : 'above';
}
