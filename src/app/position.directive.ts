import {Directive, ElementRef, EventEmitter, NgZone, OnInit, Output} from '@angular/core';
import {auditTime, fromEvent} from "rxjs";

type Position = 'above' | 'below';

@Directive({
  selector: '[appPosition]'
})
export class PositionDirective implements OnInit {

  currentPosition?: Position;

  @Output()
  positionChange: EventEmitter<Position> = new EventEmitter<Position>();

  constructor(private elementRef: ElementRef<HTMLElement>, private ngZone: NgZone) {
  }

  ngOnInit() {
    this.currentPosition = this.getPosition();
    this.positionChange.emit(this.currentPosition);
    this.listenForPositionChange();
  }

  listenForPositionChange() {
    this.ngZone.runOutsideAngular(() => {
        return fromEvent(window, 'scroll').subscribe(() => {
          const newPosition = this.getPosition();
          if (this.currentPosition != newPosition) {
            this.currentPosition = newPosition;
            this.ngZone.run(() => this.positionChange.emit(this.currentPosition));
          }
        });
      }
    )

  }

  getPosition() {
    return getElementPostionRelativeToViewportTop(this.elementRef.nativeElement);
  }
}

function getElementPostionRelativeToViewportTop(element: HTMLElement) {
  return element.getBoundingClientRect().y > 0 ? 'below' : 'above';
}
