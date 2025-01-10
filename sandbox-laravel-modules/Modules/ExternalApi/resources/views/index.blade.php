@extends('externalapi::layouts.master')

@section('content')
    <h1>Hello World</h1>

    <p>Module: {!! config('externalapi.name') !!}</p>
@endsection
